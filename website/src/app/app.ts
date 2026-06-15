import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '$/layout/header/header';
import { MainLayout } from '$/layout/main-layout/main-layout';
import { Footer } from '$/layout/footer/footer';

@Component({
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.css',
	imports: [RouterOutlet, Header, MainLayout, Footer],
})
export class App {}
