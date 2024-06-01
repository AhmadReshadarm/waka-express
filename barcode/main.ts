import path from 'path';
import 'reflect-metadata';
import { bootstrap } from '../core/bootstrap';
import { BarcodeApp } from './barcode.app';
import bannerDataSource from './barcode.data-source';

const controllerPaths = path.resolve(__dirname, './load-controllers.js');
const { PORT } = process.env;

bootstrap(Number(PORT ?? 8080), BarcodeApp, controllerPaths, bannerDataSource);
