import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CodeEditorComponent } from './util/code-editor/code-editor.component';
import { MainViewComponent } from './view/main-view/main-view.component';

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'app-name/assets', // configure base path cotaining monaco-editor directory after build default: './assets'
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: () => { console.log((<any>window).monaco); } // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
};

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    MainViewComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MonacoEditorModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
