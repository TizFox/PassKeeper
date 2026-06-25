import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NgxSonnerToaster } from 'ngx-sonner';

import { Header } from '$/layout/header';
import { MainLayout } from '$/layout/main-layout';
import { Footer } from '$/layout/footer';

@Component({
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.css',
	imports: [RouterOutlet, NgxSonnerToaster, Header, MainLayout, Footer],
})
export class App {}
