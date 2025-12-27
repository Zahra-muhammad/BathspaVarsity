let currentUser = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let calendarEvents = [];
let userSchedules = [];

// Fetch and display current user info
async function loadUserProfile() {
  try {
    console.log('🔄 Loading user profile...');
    
    const response = await fetch('/users/current-user', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      currentUser = await response.json();
      console.log('✅ User data received:', currentUser);
      
      // Update player name
      const playerNameElement = document.querySelector('.player-name');
      if (playerNameElement) {
        playerNameElement.textContent = currentUser.name;
      }
      
      // Update avatar with initials or profile picture
      const avatarElement = document.querySelector('.avatar');
      if (avatarElement) {
        if (currentUser.profilePicture) {
          avatarElement.style.backgroundImage = `url('${currentUser.profilePicture}')`;
          avatarElement.style.backgroundSize = 'cover';
          avatarElement.style.backgroundPosition = 'center';
        } else {
          const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
          avatarElement.textContent = initials;
          avatarElement.style.display = 'flex';
          avatarElement.style.alignItems = 'center';
          avatarElement.style.justifyContent = 'center';
          avatarElement.style.fontSize = '1.5rem';
          avatarElement.style.fontWeight = 'bold';
        }
      }

      // Check if user has player profile
      if (currentUser.playerProfile && currentUser.playerProfile.isPlayer) {
        const profile = currentUser.playerProfile;
        console.log('🏀 Player profile found:', profile);
        
        // Update position
        const positionElement = document.querySelector('.player-position');
        if (positionElement) {
          positionElement.textContent = profile.position || 'Not Set';
        }

        // Update varsity team
        const teamElement = document.querySelector('.varsity-team');
        if (teamElement) {
          teamElement.textContent = profile.team || 'Not Set';
        }

        // Update varsity sport
        const sportElement = document.querySelector('.varsity-sport');
        if (sportElement) {
          sportElement.textContent = profile.sport ? profile.sport.toUpperCase() : 'Not Set';
        }

        // Update attributes
        const attrSport = document.getElementById('attr-sport');
        const attrPosition = document.getElementById('attr-position');
        const attrHand = document.getElementById('attr-hand');
        const attrTraining = document.getElementById('attr-training');

        if (attrSport) attrSport.textContent = profile.sport || 'Not Set';
        if (attrPosition) attrPosition.textContent = profile.position || 'Not Set';
        if (attrHand) attrHand.textContent = profile.dominantHand || 'Not Set';
        if (attrTraining) attrTraining.textContent = profile.trainingSkills || 'Not Set';

        console.log('✅ Player profile loaded successfully');
        
        // Load schedule and activities for this user
        loadUserSchedule();
        loadUserActivities();
        loadCalendarEvents();
      } else {
        console.log('⚠️ No player profile found. Showing demo data...');
        // Still load schedules and activities even without player profile
        loadUserSchedule();
        loadUserActivities();
        loadCalendarEvents();
      }
    } else {
      console.log('⚠️ User not authenticated, loading demo data...');
      // Load demo data instead of redirecting
      currentUser = { _id: 'demo', name: 'Demo User' };
      loadUserSchedule();
      loadUserActivities();
      loadCalendarEvents();
    }
  } catch (error) {
    console.error('❌ Error loading user profile:', error);
    console.log('📦 Loading demo data...');
    currentUser = { _id: 'demo', name: 'Demo User' };
    loadUserSchedule();
    loadUserActivities();
    loadCalendarEvents();
  }
}

// Load user's schedule from admin schedule system OR localStorage
async function loadUserSchedule() {
  try {
    console.log('📅 Loading user schedules...');
    let allSchedules = [];
    
    // Try to fetch from API first
    try {
      const response = await fetch('/api/schedules', {
        credentials: 'include'
      });
      
      if (response.ok) {
        allSchedules = await response.json();
        console.log('📦 Schedules from API:', allSchedules.length);
      } else {
        throw new Error('API not available');
      }
    } catch (apiError) {
      console.log('⚠️ API unavailable, checking localStorage...');
      // Fallback to localStorage
      const localSchedules = localStorage.getItem('schedules');
      if (localSchedules) {
        allSchedules = JSON.parse(localSchedules);
        console.log('📦 Schedules from localStorage:', allSchedules.length);
      }
    }
    
    // Filter schedules for current user (or show all if no userId)
    userSchedules = allSchedules.filter(s => {
      return !s.userId || !currentUser || s.userId === currentUser._id;
    });
    
    console.log('✅ User schedules filtered:', userSchedules.length);
    renderSchedule(userSchedules);
  } catch (error) {
    console.error('❌ Error loading schedule:', error);
    userSchedules = [];
    renderSchedule([]);
  }
}

// Load user's activities from API OR localStorage OR from past schedules
async function loadUserActivities() {
  try {
    console.log('✅ Loading user activities...');
    let allActivities = [];
    
    // STRATEGY 1: Try to fetch from dedicated activities API
    try {
      const response = await fetch('/api/activities', {
        credentials: 'include'
      });
      
      if (response.ok) {
        allActivities = await response.json();
        console.log('📦 Activities from API:', allActivities.length);
      } else {
        throw new Error('API not available');
      }
    } catch (apiError) {
      console.log('⚠️ Activities API unavailable, checking localStorage...');
      // Fallback to localStorage
      const localActivities = localStorage.getItem('activities');
      if (localActivities) {
        allActivities = JSON.parse(localActivities);
        console.log('📦 Activities from localStorage:', allActivities.length);
      }
    }
    
    // STRATEGY 2: If no activities found, generate from PAST schedules
    if (allActivities.length === 0) {
      console.log('⚠️ No activities found, generating from past schedules...');
      
      // Get all schedules
      let allSchedules = [];
      try {
        const response = await fetch('/api/schedules', {
          credentials: 'include'
        });
        if (response.ok) {
          allSchedules = await response.json();
        }
      } catch (err) {
        const localSchedules = localStorage.getItem('schedules');
        if (localSchedules) {
          allSchedules = JSON.parse(localSchedules);
        }
      }
      
      // Filter for user's PAST schedules
      const now = new Date();
      allActivities = allSchedules
        .filter(s => {
          // Check if belongs to user
          const isUserSchedule = !s.userId || !currentUser || s.userId === currentUser._id;
          // Check if past
          const scheduleDateTime = new Date(`${s.date}T${s.time}`);
          const isPast = scheduleDateTime < now;
          // Or check status
          const hasPastStatus = s.status && s.status.toLowerCase() === 'past';
          
          return isUserSchedule && (isPast || hasPastStatus);
        })
        .map(s => ({
          event: s.event,
          completedAt: `${s.date}T${s.time}`,
          userId: s.userId,
          status: s.status
        }));
      
      console.log('✅ Generated activities from past schedules:', allActivities.length);
    }
    
    // Filter activities for current user (or show all if no userId)
    const userActivities = allActivities.filter(a => {
      return !a.userId || !currentUser || a.userId === currentUser._id;
    });
    
    console.log('✅ User activities filtered:', userActivities.length);
    renderActivities(userActivities);
  } catch (error) {
    console.error('❌ Error loading activities:', error);
    renderActivities([]);
  }
}

// Render schedule - shows ALL upcoming schedules (no limit)
function renderSchedule(schedules) {
  const container = document.querySelector('.schedule-list');
  
  if (!container) {
    console.warn('⚠️ Schedule container not found');
    return;
  }
  
  console.log('📋 Rendering schedules. Total:', schedules.length);
  console.log('📋 Raw schedule data:', schedules);
  
  // Filter only upcoming schedules (not past)
  const now = new Date();
  const upcomingSchedules = schedules.filter(s => {
    const scheduleDateTime = new Date(`${s.date}T${s.time}`);
    const isPast = scheduleDateTime < now;
    console.log(`  Schedule: ${s.event} on ${s.date} ${s.time} - ${isPast ? 'PAST ❌' : 'UPCOMING ✅'}`);
    return !isPast;
  });
  
  console.log('✅ Upcoming schedules after filter:', upcomingSchedules.length);
  
  if (upcomingSchedules.length === 0) {
    container.innerHTML = `
      <div class="schedule-item">
        <span class="schedule-event" style="color: rgba(255, 255, 255, 0.5); font-size: 0.9rem;">
          No upcoming schedules. Add schedules from the admin panel.
        </span>
      </div>`;
    return;
  }
  
  container.innerHTML = '';
  
  // Sort schedules by date (earliest first)
  upcomingSchedules.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  
  // Show ALL upcoming schedules - NO LIMIT
  upcomingSchedules.forEach(schedule => {
    const div = document.createElement('div');
    div.className = 'schedule-item';
    
    const date = new Date(schedule.date);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const dateStr = `${day} ${month}`;
    
    div.innerHTML = `
      <span class="schedule-date">${dateStr}</span>
      <span class="schedule-event">${schedule.event}</span>
    `;
    
    container.appendChild(div);
  });
  
  console.log('✅ Schedule rendered successfully:', upcomingSchedules.length, 'events displayed');
}

// Render activities - shows ALL completed activities (no limit)
function renderActivities(activities) {
  const container = document.querySelector('.activity-list');
  
  if (!container) {
    console.warn('⚠️ Activity container not found');
    return;
  }
  
  console.log('🎯 Rendering activities. Total:', activities.length);
  console.log('🎯 Raw activities data:', activities);
  activities.forEach(a => {
    console.log(`  Activity: ${a.event} completed at ${a.completedAt}`);
  });
  
  if (activities.length === 0) {
    container.innerHTML = `
      <div class="activity-item">
        <span class="activity-text" style="color: rgba(255, 255, 255, 0.5); font-size: 0.9rem;">
          No activity history. Activities will appear here after scheduled events complete.
        </span>
      </div>`;
    return;
  }
  
  container.innerHTML = '';
  
  // Sort activities by date (most recent first)
  activities.sort((a, b) => {
    const dateA = new Date(a.completedAt);
    const dateB = new Date(b.completedAt);
    return dateB - dateA;
  });
  
  // Show ALL activities - NO LIMIT
  activities.forEach(activity => {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    // Parse the date more carefully
    let date;
    try {
      date = new Date(activity.completedAt);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for activity:', activity);
        date = new Date(); // Fallback to now
      }
    } catch (err) {
      console.error('Error parsing date:', err);
      date = new Date();
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let timeStr;
    if (diffDays === 0) {
      timeStr = 'Today';
    } else if (diffDays === 1) {
      timeStr = '1 Day ago';
    } else if (diffDays < 0) {
      // Future date (shouldn't happen for activities)
      timeStr = 'Scheduled';
    } else {
      timeStr = `${diffDays} Days ago`;
    }
    
    div.innerHTML = `
      <span class="activity-time">${timeStr}</span>
      <span class="activity-text">${activity.event}</span>
    `;
    
    container.appendChild(div);
  });
  
  console.log('✅ Activities rendered successfully:', activities.length, 'activities displayed');
}

// Load and render calendar with events from both sources
async function loadCalendarEvents() {
  try {
    console.log('📅 Loading calendar events...');
    let events = [];
    
    // Load calendar events from API or localStorage
    try {
      const calendarResponse = await fetch('/api/calendar-events', {
        credentials: 'include'
      });
      
      if (calendarResponse.ok) {
        const calendarEventsData = await calendarResponse.json();
        console.log('📆 Calendar events from API:', calendarEventsData.length);
        
        calendarEventsData.forEach(event => {
          events.push({
            date: event.date,
            title: event.title,
            type: event.type || 'event',
            source: 'calendar'
          });
        });
      } else {
        throw new Error('API not available');
      }
    } catch (apiError) {
      console.log('⚠️ Calendar API unavailable, checking localStorage...');
      const localCalendarEvents = localStorage.getItem('calendarEvents');
      if (localCalendarEvents) {
        const calendarEventsData = JSON.parse(localCalendarEvents);
        console.log('📆 Calendar events from localStorage:', calendarEventsData.length);
        
        calendarEventsData.forEach(event => {
          events.push({
            date: event.date,
            title: event.title,
            type: event.type || 'event',
            source: 'calendar'
          });
        });
      }
    }
    
    // Load schedules from API or localStorage
    try {
      const scheduleResponse = await fetch('/api/schedules', {
        credentials: 'include'
      });
      
      if (scheduleResponse.ok) {
        const schedulesData = await scheduleResponse.json();
        console.log('📋 Schedules from API:', schedulesData.length);
        
        const filteredSchedules = schedulesData.filter(s => {
          return !s.userId || !currentUser || s.userId === currentUser._id;
        });
        
        filteredSchedules.forEach(schedule => {
          events.push({
            date: schedule.date,
            title: schedule.event,
            type: 'schedule',
            source: 'schedule'
          });
        });
        
        console.log('✅ User schedules added to calendar:', filteredSchedules.length);
      } else {
        throw new Error('API not available');
      }
    } catch (apiError) {
      console.log('⚠️ Schedule API unavailable, checking localStorage...');
      const localSchedules = localStorage.getItem('schedules');
      if (localSchedules) {
        const schedulesData = JSON.parse(localSchedules);
        console.log('📋 Schedules from localStorage:', schedulesData.length);
        
        const filteredSchedules = schedulesData.filter(s => {
          return !s.userId || !currentUser || s.userId === currentUser._id;
        });
        
        filteredSchedules.forEach(schedule => {
          events.push({
            date: schedule.date,
            title: schedule.event,
            type: 'schedule',
            source: 'schedule'
          });
        });
        
        console.log('✅ User schedules added to calendar from localStorage:', filteredSchedules.length);
      }
    }
    
    calendarEvents = events;
    console.log('📅 Total calendar events:', calendarEvents.length);
    renderCalendar();
  } catch (error) {
    console.error('❌ Error loading calendar:', error);
    calendarEvents = [];
    renderCalendar();
  }
}

// Render calendar with highlighted event dates
function renderCalendar() {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Update calendar title
  const titleElement = document.querySelector('.calendar-title');
  if (titleElement) {
    titleElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }
  
  // Get first day of month and total days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Adjust first day (Monday = 0)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  const container = document.querySelector('.calendar-days');
  if (!container) {
    console.warn('⚠️ Calendar days container not found');
    return;
  }
  
  container.innerHTML = '';
  
  // Create event map for quick lookup (dates with events)
  const eventDates = new Set();
  const eventsByDate = {}; // Track multiple events per date
  
  calendarEvents.forEach(e => {
    const eventDate = new Date(e.date);
    if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
      const day = eventDate.getDate();
      eventDates.add(day);
      
      // Track event count per day
      if (!eventsByDate[day]) {
        eventsByDate[day] = [];
      }
      eventsByDate[day].push(e);
    }
  });
  
  console.log('📍 Event dates in current month:', Array.from(eventDates));
  console.log('📊 Events by date:', eventsByDate);
  
  // Get today's date for comparison
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = today.getDate();
  
  // Previous month days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const div = document.createElement('div');
    div.className = 'calendar-day prev-month';
    div.textContent = day;
    container.appendChild(div);
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    
    // Add the day number FIRST
    div.textContent = day;
    
    // Highlight today
    if (isCurrentMonth && day === todayDate) {
      div.classList.add('today');
    }
    
    // Check if this date has events and add dot indicator
    if (eventDates.has(day)) {
      div.classList.add('has-event');
      
      const eventCount = eventsByDate[day] ? eventsByDate[day].length : 1;
      
      // Add event indicator dot using CSS class
      const eventDot = document.createElement('div');
      eventDot.className = 'event-indicator-dot';
      div.appendChild(eventDot);
      
      console.log(`✅ Added event dot to day ${day} (${eventCount} event${eventCount > 1 ? 's' : ''})`);
    }
    
    container.appendChild(div);
  }
  
  // Next month days to fill grid
  const totalCells = adjustedFirstDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  
  for (let day = 1; day <= remainingCells; day++) {
    const div = document.createElement('div');
    div.className = 'calendar-day next-month';
    div.textContent = day;
    container.appendChild(div);
  }
  
  console.log('✅ Calendar rendered for', monthNames[currentMonth], currentYear);
  console.log('📊 Events in this month:', eventDates.size);
}

// Custom Cursor - ONLY if elements exist
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

if (cursor && cursorFollower) {
  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    const distX = mouseX - followerX;
    const distY = mouseY - followerY;
    
    followerX += distX * 0.1;
    followerY += distY * 0.1;
    
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const hoverElements = document.querySelectorAll('a, button, .card, .calendar-day');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// Load profile when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Player Profile Page Loaded');
  loadUserProfile();
});

// Refresh schedule and activities every 5 minutes
setInterval(() => {
  if (currentUser) {
    console.log('🔄 Auto-refreshing data...');
    loadUserSchedule();
    loadUserActivities();
    loadCalendarEvents();
  }
}, 300000); // 5 minutes (300000ms)

// Export for debugging
window.debugProfile = {
  currentUser,
  userSchedules,
  calendarEvents,
  reloadSchedule: loadUserSchedule,
  reloadCalendar: loadCalendarEvents,
  forceRefresh: () => {
    loadUserSchedule();
    loadUserActivities();
    loadCalendarEvents();
  }
};