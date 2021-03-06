import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Temperature } from './temperature.model';
import { TemperatureService } from './temperature.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-temperature',
    templateUrl: './temperature.component.html'
})
export class TemperatureComponent implements OnInit, OnDestroy {
temperatures: Temperature[];
    currentAccount: any;
    eventSubscriber: Subscription;
    currentSearch: string;

    constructor(
        private temperatureService: TemperatureService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private activatedRoute: ActivatedRoute,
        private principal: Principal
    ) {
        this.currentSearch = this.activatedRoute.snapshot && this.activatedRoute.snapshot.params['search'] ?
            this.activatedRoute.snapshot.params['search'] : '';
    }

    loadAll() {
        if (this.currentSearch) {
            this.temperatureService.search({
                query: this.currentSearch,
                }).subscribe(
                    (res: ResponseWrapper) => this.temperatures = res.json,
                    (res: ResponseWrapper) => this.onError(res.json)
                );
            return;
       }
        this.temperatureService.query().subscribe(
            (res: ResponseWrapper) => {
                this.temperatures = res.json;
                this.currentSearch = '';
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    search(query) {
        if (!query) {
            return this.clear();
        }
        this.currentSearch = query;
        this.loadAll();
    }

    clear() {
        this.currentSearch = '';
        this.loadAll();
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInTemperatures();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: Temperature) {
        return item.id;
    }
    registerChangeInTemperatures() {
        this.eventSubscriber = this.eventManager.subscribe('temperatureListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
