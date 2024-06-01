import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { Barcodes } from '../core/entities';
import { validation } from '../core/lib/validator';
import { CreateBarcodeDTO, barcodeDTO, BarcodeQueryDTO } from './barcode.dtos';
import { PaginationDTO } from '../core/lib/dto';

@singleton()
export class BarcodeService {
  private barcodeRepository: Repository<Barcodes>;

  constructor(dataSource: DataSource) {
    this.barcodeRepository = dataSource.getRepository(Barcodes);
  }

  async getAllBarcode(queryParams: BarcodeQueryDTO): Promise<PaginationDTO<barcodeDTO | Barcodes[]>> {
    const { code, checked, sortBy = 'createdAt', orderBy = 'DESC', offset = 0, limit = 1000 } = queryParams;
    //
    const queryBuilder = this.barcodeRepository.createQueryBuilder('barcode');
    if (code) {
      queryBuilder.andWhere('barcode.code = :code', { code: `%${code}%` });
    }
    if (checked) {
      queryBuilder.andWhere('barcode.checked = :checked', { checked: JSON.parse(checked as any) });
    }
    queryBuilder.orderBy(`barcode.${sortBy}`, orderBy).skip(offset).take(limit);
    //
    return {
      rows: await queryBuilder.getMany(),
      length: await queryBuilder.getCount(),
    };
  }

  async getBarcode(id: string): Promise<Barcodes> {
    const barcode = await this.barcodeRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });
    return barcode;
  }

  async getBarcodeByCode(code: string): Promise<Barcodes> {
    const barcode = await this.barcodeRepository
      // .findOneOrFail({
      //   where: {
      //     code: Equal(code),
      //   },
      // });
      .createQueryBuilder('barcode')
      .where('barcode.code = :code', { code: code })
      .getOne();
    // if (!barcode) {
    //   throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    // }

    return barcode!;
  }

  async createBarcode(barcodeDTO: CreateBarcodeDTO): Promise<Barcodes> {
    // const newNews = await validation(new News(newsDTO));

    return this.barcodeRepository.save(barcodeDTO);
  }

  async updateBarcode(id: string, barcodeDTO: Barcodes) {
    const barcode = await this.barcodeRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    return this.barcodeRepository.save({
      ...barcode,
      ...barcodeDTO,
    });
  }

  async removeBarcode(id: string) {
    const barcode = await this.barcodeRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    return this.barcodeRepository.remove(barcode);
  }
}
