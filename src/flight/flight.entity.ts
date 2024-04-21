import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'flights_2' })
export class Flight {
  @PrimaryGeneratedColumn()
  flight_id: number;

  @Column({
    name: 'origin_airport',
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  originAirport: string;

  @Column({
    name: 'destination_airport',
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  destinationAirport: string;

  @Column({ name: 'departure_time', type: 'int4', nullable: false })
  departureTime: number;

  @Column({
    name: 'arrival_time',
    type: 'int4',
    nullable: false,
  })
  arrivalTime: number;

  @Column({ name: 'distance', type: 'int4', nullable: false })
  distance: number;

  @Column({ name: 'flight_duration_minutes', type: 'int4', nullable: false })
  flightDurationMinutes: number;
}
