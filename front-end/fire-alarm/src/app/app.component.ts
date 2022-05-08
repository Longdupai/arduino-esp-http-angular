import { Component, OnInit } from '@angular/core';
import { collectionData, Firestore, collection, updateDoc, doc } from '@angular/fire/firestore';
import  {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { LimitModalComponent } from './components/limit-modal/limit-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fire-alarm';

  constructor(private db: Firestore,private modalService: NgbModal) {
    // console.log("tesst");
    
  }

  public alarm: boolean = false;
  public limit: any = 0;
  public date: any = {
    hr: 0,
    min: 0
  };
  public temp: any = 0;
  public hasFire: boolean = false;
  public fireStartAt: any = {
    hr: 0,
    min: 0
  }
  ngOnInit(): void {
    
    this.start();
  }

  start() {
    const fsRef = collection(this.db, 'main');
    collectionData(fsRef).subscribe((data: any) => {
      console.log(data);
      this.alarm = data[0].alarm;
      this.limit = data[1].limit;
      this.temp = data[2].temp;
      let currDate = new Date(data[2].date);
      this.date = {
        hr: currDate.getHours(),
        min: currDate.getMinutes()
      }
      if (this.limit <= this.temp) {
        this.hasFire = true;
      }else{
        this.hasFire = false;
      }
    })
  }

  openModal(){
    
    const modalRef = this.modalService.open(LimitModalComponent);
    modalRef.componentInstance.limit = this.limit;
    modalRef.result.then((res:any)=>{
      if(res!==false){
        this.updateLimit(res);
      }
    });
    
  }

  async updateLimit(limit:number){
    const limitRef = doc(this.db, 'main', 'limit');
    await updateDoc(limitRef, { limit: limit });
  }
}
