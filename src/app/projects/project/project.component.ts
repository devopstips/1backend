import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule, MatTabGroup } from '@angular/material';
import * as types from '../../types';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../../user.service';
import { ProjectService } from '../../project.service';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NotificationsService } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';
import { ProjectStatusComponent } from './code/project-status/project-status.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  selectedIndex = 0;
  tab = '';
  author = '';
  projectName = '';
  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  lastBuild: types.Build;
  leftWidth = 19;
  that = this;
  status: boolean;
  issueId = '';
  loaded = false;
  stars: number;
  starred = false;

  @ViewChild('status') private projectStatus: ProjectStatusComponent;

  project: types.Project = {
    Endpoints: [],
    Builds: []
  };

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private ps: ProjectService,
    public us: UserService,
    private notif: NotificationsService,
    private title: Title
  ) {}

  refresh(): void {
    this.ps
      .getByAuthorAndProjectName(this.author, this.projectName)
      .then(project => {
        if (project.Builds && project.Builds.length) {
          this.lastBuild = project.Builds[0];
        }
        if (!project.ReadMe) {
          project.ReadMe =
            project.Name + "\n===\nThis project doesn't have a readme yet.";
        }
        if (project.Starrers) {
          for (const s of project.Starrers) {
            if (s.Id === this.us.user.Id) {
              this.starred = true;
            }
          }
        }
        this.loaded = true;
        this.stars = project.Stars;
        this.project = project;
      });
  }

  ngOnInit() {
    this.author = this.route.snapshot.params['author'];
    this.projectName = this.route.snapshot.params['project'];
    this.tab = this.route.snapshot.params['tab'];
    this.issueId = this.route.snapshot.params['issueId'];
    this.title.setTitle(this.author + '/' + this.projectName);

    this.refresh();

    if (this.tab === 'builds') {
      this.selectedIndex = 1;
    }
    if (this.tab === 'issues' || this.issueId) {
      this.selectedIndex = 2;
    }
    if (this.tab === 'stars') {
      this.selectedIndex = 3;
    }
    if (this.tab === 'logs') {
      this.selectedIndex = 4;
    }
    if (this.tab === 'settings') {
      this.selectedIndex = 5;
    }
    if (this.tab === 'sql') {
      this.selectedIndex = 6;
    }

    setInterval(() => {
      if (!this.lastBuild.InProgress) {
        return;
      }
      this.updateBuilds();
      this.projectStatus.getStatus();
    }, 5000);
  }

  selectedIndexChange(tabGroup: MatTabGroup) {
    const pid = tabGroup._tabs.find((e, i, a) => i === tabGroup.selectedIndex)
      .content.viewContainerRef.element.nativeElement.dataset.pid;
    if (pid !== 'code') {
      this.location.go('/' + this.author + '/' + this.projectName + '/' + pid);
    } else {
      this.location.go('/' + this.author + '/' + this.projectName);
    }
  }

  updateBuilds() {
    this.ps
      .getByAuthorAndProjectName(this.author, this.projectName)
      .then(project => {
        if (project.Builds && project.Builds.length) {
          this.lastBuild = project.Builds[0];
          this.project.Builds = project.Builds;
        }
      });
  }
}
