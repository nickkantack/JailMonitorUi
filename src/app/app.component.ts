import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CsvRepository } from './services/csv-repository.service';
import { Authenticator } from './services/authenticator.service';
import { FormsModule } from '@angular/forms';
import { StatusColor } from './constants/constants';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'JailMonitorUi';

  names: string[][] = [];
  private emailAddress: string;
  private areThereUnsavedChanges: boolean = false;
  private hasLoadedNamesFromServer: boolean = false;
  message = "";
  flash = false;
  statusColor: StatusColor = StatusColor.NEUTRAL;

  constructor(
    private csvRepository: CsvRepository,
    private authenticator: Authenticator
  ) {
    csvRepository.initializeWithCredentials(authenticator.getCreds());
    // TODO use path or something else to set email address
    this.emailAddress = "nickkantack@gmail.com";
    this.makeLocalNamesMatchRemote();
  }

  test() {
    this.updateMessage(Math.random().toString(), StatusColor.NEUTRAL);
    // this.makeLocalNamesMatchRemote();
  }

  updateMessage(newMessage: string, color: StatusColor) {
    this.flash = false;

    // Re-trigger the animation
    setTimeout(() => {
      this.flash = true;
    });
    setTimeout(() => {
      this.flash = false;
    }, 500);

    // Change the text at the point in the animation where it is
    // invisible
    setTimeout(() => {
      this.message = newMessage;
      if (color) this.statusColor = color;
    }, 500);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.areThereUnsavedChanges) {
      $event.preventDefault();
      $event.returnValue = '';
    }
  }

  addName() {
    this.names.push(["", ""]);
  }

  deleteRow(index: number): void {
    this.names.splice(index, 1);
    this.noteUnsavedChanges();
  }

  noteUnsavedChanges() {
    if (!this.areThereUnsavedChanges) {
      this.updateMessage(`Changes are not yet saved.`, StatusColor.WARN);
    }
    console.log(`There are unsaved changes`);
    this.areThereUnsavedChanges = true;
  }

  makeLocalNamesMatchRemote() {

    if (this.areThereUnsavedChanges) {
      if (!confirm(`You have unsaved changes on this page. Loading will replace everything on this page with the latest saved list of names. Are you sure you want to load the name list from the server and lose local changes?`)) {
        alert(`Your local changes have been preserved.`);
        return;
      }
    }

    this.updateMessage(`Loading names...`, StatusColor.NEUTRAL);

    this.csvRepository.getNameListFromRemote(this.emailAddress, 
      (x: string[][]) => {
        this.names = x;
        this.updateMessage(`Successfully loaded names from server.`, StatusColor.SUCCESS);
        this.hasLoadedNamesFromServer = true;
      },
      (x: string) => {
        this.updateMessage(`Error fetching names. Consider refreshing page.`, StatusColor.FAILURE);
        console.error(`Error from server: ${x}`);
      },

    );
  }

  makeRemoteMatchLocalNames() {

    // First, do some validation
    this.names = this.names.filter((x: string[]) => {
      return x[0] || x[1];  
    });

    if (!this.hasLoadedNamesFromServer) {
      if (!confirm(`Are you sure you want to save your local list? Any previous list from the server has not been loaded yet, so proceeding might overwrite what is present on the server. Do you still want to save your current list?`)) {
        return;
      }
    }
    this.hasLoadedNamesFromServer = true;

    this.updateMessage(`Saving to server...`, StatusColor.WARN);
    this.csvRepository.publishNameListToRemote(this.emailAddress, this.names, (x: string) => {
      console.log(`Finished pushing names to remote`);
      this.updateMessage(`Changes saved to server.`, StatusColor.SUCCESS);
    });

    this.areThereUnsavedChanges = false;
  }

}
