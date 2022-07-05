import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { AuthService } from 'src/app/auth/services/auth.service';
import { StatisticsService } from '../services/statistics.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  most_selled_products:Array<any> = []
  seller_employees:Array<any> = []
  money_employees:Array<any> = []
  rich_clients:Array<any> = []
  frecuency_clients:Array<any> = []
  current_week:any
  date_key: string = 'week'
  case_client: number = 1
  case_employee: number = 1

  ngOnInit() {
    this.current_week = this.ProcessDate(this.getFullDay(), 'week')
    this.getStatistics('all', 'week', this.current_week)
  }
  get usuario(){
    return this.authService.usuario
  }

  constructor(private router:Router,
              private authService: AuthService,
              private statisticsService: StatisticsService) { }

  logout(){
    this.router.navigateByUrl('/auth');
    this.authService.logout();
  }

  getNumberWeek(){
    let currentDate:any = new Date();
    let startDate:any = new Date(currentDate.getFullYear(), 0, 1);
    let days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7)
  }
  toggleClient(){
    this.case_client = this.case_client == 1 ? 2 : 1
  }
  toggleEmployee(){
    this.case_employee = this.case_employee == 1 ? 2 : 1
  }

  getFullDay(){
    let fecha = new Date()
    let date = fecha.getFullYear() + '-'
        + ('0' + (fecha.getMonth()+1)).slice(-2) + '-'
        + ('0' + fecha.getDate()).slice(-2);
    return date
  }

  ProcessDate(date:string, date_key:string){
    console.log('date type', typeof date);
    if(date_key === 'year'){
        date = date.split('-')[0]
    }else if(date_key === 'month'){
        let date_arr:string[] = date.split('-')
        date_arr.pop()
        date = date_arr.join('-')
    }else if(date_key === 'week'){
        date = date.split('-')[0]
        let week = this.getNumberWeek().toString()
        date = `${date}-${week}`
    }
    return date
  }

  getStatistics(statistic:string, date_key:string, date:string){
    this.statisticsService.getStatistics(statistic, date_key, date)
      .subscribe(res =>{
        console.log(res);
        switch (statistic) {
          case 'all':
            this.most_selled_products = res.statistics.most_selled_products
            this.seller_employees = res.statistics.seller_employees
            this.money_employees = res.statistics.money_employees
            this.rich_clients = res.statistics.rich_clients
            this.frecuency_clients = res.statistics.frecuency_clients
            break;
          case 'most_selled_products':
            this.most_selled_products = res.statistics.most_selled_products
            break;
          case 'seller_employees':
            this.seller_employees = res.statistics.seller_employees
            break;
          case 'money_employees':
            this.money_employees = res.statistics.money_employees
            break;
          case 'rich_clients':
            this.rich_clients = res.statistics.rich_clients
            break;
          case 'frecuency_clients':
            this.frecuency_clients = res.statistics.frecuency_clients
            break;
          default:
            break;
        }
      })
  }

  changeDate(statistic:string){
    let date = ''
    switch (this.date_key) {
      case 'week':
        this.date_key = 'month'
        date = this.ProcessDate(this.getFullDay(), this.date_key)
        this.getStatistics(statistic,this.date_key,date)
        break;
        case 'month':
          this.date_key = 'year'
          date = this.ProcessDate(this.getFullDay(), this.date_key)
          this.getStatistics(statistic,this.date_key,date)
        break;
      case 'year':
        this.date_key = 'day'
        date = this.ProcessDate(this.getFullDay(), this.date_key)
        this.getStatistics(statistic,this.date_key,date)
        break;
      case 'day':
        this.date_key = 'week'
        date = this.ProcessDate(this.getFullDay(), this.date_key)
        this.getStatistics(statistic,this.date_key,date)
        break;
    
      default:
        break;
    }
    
  }

}
