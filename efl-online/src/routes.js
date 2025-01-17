



import DefaultDash from './pages/dashboards/default'
import AdminDash from './pages/dashboards/admin'
import ApproverDash from './pages/dashboards/approver'
import PlayerDash from './pages/dashboards/player'


import LoginPage from './pages/login'
import DiscordLanding from './pages/landing/discord'
import SetupLanding from './pages/landing/setup'
import DirectorLanding from './pages/landing/director'
import Profile from './pages/profile'
import PlayerCreate from './pages/player/create'

export const routes = [
    { 
      path: '/dashboard/eflo', 
      component: DefaultDash, 
      category:'Dashboard', 
      title: 'Home', 
      ShowInNav: true 
    },
    { 
      path: '/dashboard/admin', 
      component: AdminDash, 
      category:'Dashboard', 
      title: 'Admin Dashboard', 
      ShowInNav: true 
    },
    { 
      path: '/dashboard/approver', 
      component: ApproverDash, 
      category:'Dashboard', 
      title: 'Approver Dashboard', 
      ShowInNav: true 

    },
    { 
      path: '/dashboard/player', 
      component: PlayerDash, 
      category:'Dashboard', 
      title: 'Player Dashboard', 
      ShowInNav: true 

    },

    
    { 
      path: '/data/teams', 
      component: PlayerDash, 
      category:'Data', 
      title: 'Teams', 
      ShowInNav: true 

    },
    { 
      path: '/data/players', 
      component: PlayerDash, 
      category:'Data', 
      title: 'Players', 
      ShowInNav: true 

    },


    { 
      path: '/player/create', 
      component: PlayerCreate, 
      category: 'Player', 
      title: 'Create a new player', 
      ShowInNav: true
    },


    { 
      path: '/', 
      component: DirectorLanding, 
      category: 'Landing', 
      title: 'Routing', 
      ShowInNav: false 
    },
    { 
      path: '/login', 
      component: LoginPage, 
      category: 'Login', 
      title: 'Login', 
      ShowInNav: false 
    },
    { 
      path: '/discord', 
      component: DiscordLanding, 
      category: 'Landing', 
      title: 'Discord', 
      ShowInNav: false 
    },
    { 
      path: '/setup', 
      component: SetupLanding, 
      category: 'Landing', 
      title: 'Setup', 
      ShowInNav: false 
    }

    ,
    { 
      path: '/profile/:userId', 
      component: Profile, 
      category: 'Profile', 
      title: 'Profile', 
      ShowInNav: false 
    }


    // Add more routes as needed
  ];