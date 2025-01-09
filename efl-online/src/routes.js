



import DefaultDash from './pages/dashboards/default'
import AdminDash from './pages/dashboards/admin'
import ApproverDash from './pages/dashboards/approver'
import PlayerDash from './pages/dashboards/player'


import LoginPage from './pages/login'

export const routes = [
    { 
      path: '/', 
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
      path: '/data/players', 
      component: PlayerDash, 
      category:'Data', 
      title: 'Player Search', 
      ShowInNav: true 

    },



    { 
      path: '/login', 
      component: LoginPage, 
      category: 'Login', 
      title: 'Login', 
      ShowInNav: false 
    }


    // Add more routes as needed
  ];