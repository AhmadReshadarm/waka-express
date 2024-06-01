import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../core/lib/http-status';
import { BarcodeService } from './barcode.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../core/decorators';
import { isAdmin, verifyToken } from '../core/middlewares';
import generator from 'generate-password';
import { Barcodes } from 'core/entities';

@singleton()
@Controller('/barcode')
export class BarcodeController {
  constructor(private barcodeService: BarcodeService) {}

  @Get()
  // @Middleware([verifyToken, isAdmin])
  async getAllBarcode(req: Request, resp: Response) {
    try {
      const barcode = await this.barcodeService.getAllBarcode(req.query);

      resp.json(barcode);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Get(':id')
  async getBarcode(req: Request, resp: Response) {
    const { id } = req.params;
    try {
      const barcode = await this.barcodeService.getBarcode(id);

      resp.status(HttpStatus.OK).json(barcode);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Get('by-code/:code')
  async getBarcodeByCode(req: Request, resp: Response) {
    const { code } = req.params;
    try {
      const barcode = await this.barcodeService.getBarcodeByCode(code);
      if (!barcode) {
        resp.status(HttpStatus.NOT_FOUND).json('Not authentic');
        return;
      }
      if (barcode.counter < 11) {
        if (barcode.checked) {
          barcode.counter = barcode.counter + 1;
          const checked = await this.barcodeService.updateBarcode(barcode.id, { ...barcode });
          resp.status(HttpStatus.FORBIDDEN).json(checked);
          return;
        }
        barcode.checked = true;
        barcode.counter = barcode.counter + 1;
        const checked = await this.barcodeService.updateBarcode(barcode.id, { ...barcode });
        resp.status(HttpStatus.OK).json(checked);
        return;
      }
      if (barcode.counter >= 11) {
        resp.status(HttpStatus.TOO_MANY_REQUESTS).json(barcode);
        return;
      }
      if (barcode.checked) {
        resp.status(HttpStatus.FORBIDDEN).json(barcode);
        return;
      }
      barcode.checked = true;
      barcode.counter = barcode.counter + 1;
      const checked = await this.barcodeService.updateBarcode(barcode.id, { ...barcode });
      resp.status(HttpStatus.OK).json(checked);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Post('')
  @Middleware([verifyToken, isAdmin])
  async createBarcode(req: Request, resp: Response) {
    try {
      const created = await this.barcodeService.createBarcode(req.body);

      resp.status(HttpStatus.CREATED).json(created);
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }
  @Post('generate')
  @Middleware([verifyToken, isAdmin])
  async generateBarcode(req: Request, resp: Response) {
    try {
      const generatedBarcodes: Barcodes[] = [];
      let counter = 0;
      let oneTime = false;
      const generatorFunction = async (barcodeLenght: number, startsWith: string) => {
        if (barcodeLenght >= counter) {
          const generatedBarcode = generator.generate({
            length: 9,
            numbers: true,
            // symbols: true,
            // uppercase: false,
            excludeSimilarCharacters: true,
            strict: true,
          });
          const payload = {
            code: `${startsWith}${generatedBarcode.toUpperCase()}`,
            checked: false,
          };
          const barcode = await this.barcodeService.getBarcodeByCode(payload.code);
          if (barcode) {
            generatorFunction(Number(req.body.barcodeLenght), req.body.startsWith);
          }
          const created = await this.barcodeService.createBarcode(payload);
          generatedBarcodes.push(created);
          counter = counter + 1;
          generatorFunction(Number(req.body.barcodeLenght), req.body.startsWith);
        }
        if (barcodeLenght <= counter && !oneTime) {
          oneTime = true;
          resp.status(HttpStatus.CREATED).json(generatedBarcodes);
        }
      };
      // ------------------
      generatorFunction(Number(req.body.barcodeLenght), req.body.startsWith);
      // resp.status(HttpStatus.CREATED).json(generatedBarcodes);
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  @Put(':id')
  @Middleware([verifyToken, isAdmin])
  async updateBarcode(req: Request, resp: Response) {
    try {
      const { id } = req.params;
      const updated = await this.barcodeService.updateBarcode(id, req.body);

      resp.status(HttpStatus.OK).json(updated);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong ${error}` });
    }
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async deleteBarcode(req: Request, resp: Response) {
    const { id } = req.params;
    try {
      const removed = await this.barcodeService.removeBarcode(id);
      resp.status(HttpStatus.OK).json(removed);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong ${error}` });
    }
  }
}
