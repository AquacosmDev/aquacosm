import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from } from 'rxjs';

@Component({
  selector: 'aqc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public credentials = {
    name: '',
    password: ''
  };

  public error!: string | null;

  constructor(private afAuth: AngularFireAuth, private router: Router) { }

  ngOnInit(): void {
  }

  public login() {
    this.error = null;
    from(this.afAuth.signInWithEmailAndPassword(this.credentials.name, this.credentials.password))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin'])
        },
        error: () => {
          this.error = 'Username or password unknown.'
        }
      });
  }

}
