import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';
import { MetaDataEditorService } from '@core/collections/meta-data-editor.service';

@Component({
  selector: 'aqc-add-editor',
  templateUrl: './add-editor.component.html',
  styleUrls: ['./add-editor.component.scss']
})
export class AddEditorComponent extends SimpleModalComponent<{ metaDataId: string }, any> implements OnInit{
  public metaDataId!: string;

  public metaDataEditor!: MetaDataEditor;
  public created = false;
  public mailTo!: string;

  constructor(private metaDataEditorService: MetaDataEditorService) {
    super();
  }

  ngOnInit() {
    this.metaDataEditor = { metaDataId: this.metaDataId };
    this.createMailTo();
  }

  public createEditor() {
    if (!!this.metaDataEditor.email && this.metaDataEditor.email.length > 0) {
      this.metaDataEditorService.addWithoutPassword(this.metaDataEditor)
        .subscribe(metaDataEditor => {
          this.metaDataEditor = metaDataEditor;
          this.created = true;
          this.createMailTo();
        });
    }
  }

  private createMailTo() {
    this.mailTo = `mailto:?subject=Edit Meta Data Entry @Aquacosm Data Portal&body=You can now edit a metadata entry in the aquacosm data portal. Go to https://aquacosm-data.web.app/admin/meta-data/${this.metaDataId} and login with name: ${this.metaDataEditor.email} and password: ${this.metaDataEditor.password}.%0D%0A%0D%0AKind Regards,%0D%0AThe aquacosm data portal team.`
  }
}
