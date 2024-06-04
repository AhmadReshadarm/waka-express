import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Barcodes {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  code: string;

  @Column()
  productName: string;

  @Column()
  productLine: string;

  @Column()
  serialNumber: string;

  @Column()
  productCode: string;

  @Column({ default: false })
  checked: boolean;

  @Column({ default: 0 })
  counter: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(args?: {
    code: string;
    checked: boolean;
    productName: string;
    productLine: string;
    serialNumber: string;
    productCode: string;
  }) {
    if (args) {
      this.code = args.code;
      this.checked = args.checked;
      this.productName = args.productName;
      this.productLine = args.productLine;
      this.serialNumber = args.serialNumber;
      this.productCode = args.productCode;
    }
  }
}
