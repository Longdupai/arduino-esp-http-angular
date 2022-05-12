import { Component, OnDestroy, OnInit } from '@angular/core';
import { collectionData, Firestore, collection, updateDoc, doc } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { LimitModalComponent } from './components/limit-modal/limit-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fire-alarm';
  private componentDestroyed = new Subject<any>();

  constructor(private db: Firestore, private modalService: NgbModal) {
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
  public dateFormat: any;
  ngOnInit(): void {

    this.start();
  }



  start() {
    const fsRef = collection(this.db, 'main');
    collectionData(fsRef).pipe(takeUntil(this.componentDestroyed)).subscribe((data: any) => {
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
        if (this.hasFire == false) {
          updateDoc(doc(this.db, 'main', 'time'), { date: Date.now() })
          this.hasFire = true;
          // this.dateFormat = new Date(data[2].date);
          let temp = new Date(data[3].date);
          this.dateFormat = temp.getUTCDate() + "/" + (temp.getUTCMonth() + 1) + '/' + temp.getUTCFullYear() + " - " + temp.getHours() + ":" + temp.getMinutes();
        }
      } else {
        this.hasFire = false;
        this.dateFormat = 0;
      }
    })
  }

  openModal() {

    const modalRef = this.modalService.open(LimitModalComponent);
    modalRef.componentInstance.limit = this.limit;
    modalRef.result.then((res: any) => {
      if (res !== false) {
        this.updateLimit(res);
      }
    });

  }


  async updateLimit(limit: number) {
    const limitRef = doc(this.db, 'main', 'limit');
    await updateDoc(limitRef, { limit: limit });
  }
  async turnAlarm(temp: any) {
    if (temp == 'on') {
      await updateDoc(doc(this.db, 'main', 'alarm'), { alarm: true })
    }
    else {
      await updateDoc(doc(this.db, 'main', 'alarm'), { alarm: false })
    }

  }
  ngOnDestroy() {
    this.componentDestroyed.next();

  }
}
