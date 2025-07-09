



import DefaultDash from './pages/dashboards/default'
import ApproverDash from './pages/dashboards/approver'


import LoginPage from './pages/login'
import DiscordLanding from './pages/landing/discord'
import SetupLanding from './pages/landing/setup'
import DirectorLanding from './pages/landing/director'
import Profile from './pages/profile'
import PlayerCreate from './pages/player/create'
import PlayerUpdatePage from './pages/player/update'
import PlayerProfilePage from './pages/player/profile'
import TeamProfilePage from './pages/team/profile'
import DataViewer from './pages/data/DataViewer'
import TeamsIndex from './pages/dashboards/teams'

export const routes = [
    

  { 
    path: '/player/create', 
    component: PlayerCreate, 
    category: 'Player', 
    title: 'Create a new player', 
    ShowInNav: false
  },
  { 
    path: '/player/:playerId/update', 
    component: PlayerUpdatePage, 
    category: 'Player', 
    title: 'Update your player', 
    ShowInNav: false
  },
  
  { 
    path: '/player/:playerId/profile', 
    component: PlayerProfilePage, 
    category: 'Player', 
    title: 'Player Profile', 
    ShowInNav: false
  },

  

  { 
    path: '/team', 
    component: TeamsIndex, 
    category: 'Team', 
    title: 'Teams Index', 
    ShowInNav: false
  },

  { 
    path: '/team/:teamId/profile', 
    component: TeamProfilePage, 
    category: 'Team', 
    title: 'Team Profile', 
    ShowInNav: false
  },







  { 
    path: '/data/:objName', 
    component: DataViewer, 
    category:'Data', 
    title: 'Data Viewer', 
    ShowInNav: false
  },

  
  { 
    path: '/data/:objName', 
    component: DataViewer, 
    category:'Data', 
    title: 'Data Viewer', 
    ShowInNav: false
  },















    {
    path: '/dashboard/eflo', 
    component: DefaultDash, 
    category:'Dashboard', 
    title: 'Home', 
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