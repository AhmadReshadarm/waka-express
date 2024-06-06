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
          resp.status(HttpStatus.OK).json(checked);
          // FORBIDDEN
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
      // if (barcode.checked) {
      //   resp.status(HttpStatus.FORBIDDEN).json(barcode);
      //   return;
      // }
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

  generateSerialNumber = (length: number) => {
    let serialNumber = '';
    for (let i = 0; i < length; i++) {
      serialNumber = serialNumber + `${Math.floor(Math.random() * 10)}`;
    }
    return serialNumber;
  };

  @Post('generate')
  @Middleware([verifyToken, isAdmin])
  async generateBarcode(req: Request, resp: Response) {
    try {
      let productLineCounter = 0;

      const generatorFunction = async (
        barcodeLenght: number,
        startsWith: string,
        productName: string,
        iterrationLenght: number,
        serialNumber: string,
        productCode: string,
        counter: number,
      ) => {
        if (barcodeLenght > counter) {
          const generatedBarcode = generator.generate({
            length: 10,
            numbers: true,
            excludeSimilarCharacters: true,
            strict: true,
          });

          const payload = {
            code: `${startsWith.toUpperCase()}${generatedBarcode.toUpperCase()}`,
            productLine: req.body.productlineName,
            productName: productName,
            serialNumber,
            productCode,
            checked: false,
          };
          const barcode = await this.barcodeService.getBarcodeByCode(payload.code);
          if (barcode) {
            generatorFunction(
              barcodeLenght,
              startsWith,
              productName,
              iterrationLenght,
              serialNumber,
              productCode,
              counter,
            );
          }

          await this.barcodeService.createBarcode(payload);

          counter = counter + 1;
          generatorFunction(
            barcodeLenght,
            startsWith,
            productName,
            iterrationLenght,
            serialNumber,
            productCode,
            counter,
          );
        }
      };

      const ProductLineIterration = async (iterrationLenght: number, startsWith: string, productName: string) => {
        const serialNumber = this.generateSerialNumber(13);
        const productCode = this.generateSerialNumber(12);
        let counter = 0;

        if (iterrationLenght >= productLineCounter) {
          await generatorFunction(
            Number(req.body.barcodeLenght),
            startsWith,
            productName,
            iterrationLenght,
            serialNumber,
            productCode,
            counter,
          );
          productLineCounter = productLineCounter + 1;
          await ProductLineIterration(iterrationLenght, startsWith, req.body.productLine[productLineCounter].name);
        }
      };

      resp.status(HttpStatus.OK).json('success');

      await ProductLineIterration(
        Number(req.body.productLine.length - 1),
        req.body.startsWith,
        req.body.productLine[productLineCounter].name,
      );
    } catch (error: any) {
      console.log(error);

      // resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
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
