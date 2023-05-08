import { UserEntity } from '@/users/entities/user.entity'
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
	ManyToOne,
} from 'typeorm'

@Entity('files')
export class FileEntity {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn({ name: 'created_at' })
	createdAt: string

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: string

	@DeleteDateColumn({ name: 'deleted_at' })
	deletedAt?: string

	@Column()
	size: number

	@Column()
	filename: string

	@Column()
	url: string

	@Column()
	folder: string

	@Column()
	rs: string

	@Column({ default: true })
	private: boolean

	@Column()
	mimetype: string

	@ManyToOne(() => UserEntity, user => user.files, {
		cascade: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: UserEntity
}
