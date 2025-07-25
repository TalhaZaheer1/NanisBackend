import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: true })
  email!: string;
  @Column({ type: "text", nullable: true })
  profilePic!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  provider!: string; // 'google', 'microsoft', 'apple', 'local'

  @Column({ nullable: true })
  otp!: string;

  @Column({ nullable: true })
  verified!: boolean;

  @Column({ nullable: true })
  preference!: string;

  @Column({nullable:true})
  lastLoggedIn!:Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}
