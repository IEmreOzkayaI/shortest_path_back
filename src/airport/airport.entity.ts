import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'airports' })
export class Airport {
  @PrimaryGeneratedColumn()
  airport_id: number;

  @Column({ name: 'iata_code', type: 'varchar', length: 250, nullable: false })
  iata_code: string;

  @Column({ name: 'airport', type: 'varchar', length: 250, nullable: false })
  airport: string;

  @Column({ name: 'city', type: 'varchar', length: 250, nullable: false })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 250, nullable: false })
  state: string;

  @Column({ name: 'country', type: 'varchar', length: 250, nullable: false })
  country: string;

  @Column({ name: 'latitude', type: 'float4', nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'float4', nullable: true })
  longitude: number;
}
