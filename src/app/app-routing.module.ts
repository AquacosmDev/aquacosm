import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkInProgressComponent } from './work-in-progress/work-in-progress.component';
import { ChartExampleComponent } from './chart-example/chart-example.component';

const routes: Routes = [
  { path: '', component: WorkInProgressComponent },
  { path: 'charts', component: ChartExampleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
