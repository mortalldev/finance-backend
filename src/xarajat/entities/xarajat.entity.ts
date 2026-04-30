import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'

@Entity('xarajatlar')
export class Xarajat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100 })
  nom: string

  @Column({ nullable: true })
  manzil: string

  @Column('decimal', { precision: 15, scale: 2 })
  miqdor: number

  @Column()
  kategoriya: string

  @Column({ type: 'timestamptz' })
  sana: Date

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
