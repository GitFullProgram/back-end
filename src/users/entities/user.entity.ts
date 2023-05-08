import { FileEntity } from '@/files/entities/file.entity'
import { UserRole } from '@/shared/enums/UserRole.enum'
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Generated,
	OneToMany,
} from 'typeorm'

@Entity('users')
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column({ unique: true })
	email: string

	@Column({ unique: true })
	username: string

	@Column()
	password: string

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole

	@CreateDateColumn({ name: 'created_at' })
	createdAt: string

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: string

	@Generated('uuid')
	@Column({ name: 'activate_link' })
	activateLink: string

	@Generated('uuid')
	@Column({ name: 'reset_link' })
	resetLink: string

	@Column()
	code: number

	@Column({ default: false })
	isActivated: boolean

	@Column({ name: 'avatar_path', default: '/uploads/user.png' })
	avatarPath: string

	@Column({ name: 'current_storage', default: 0, type: 'float' })
	currentStorage: number

	@Column({ name: 'max_storage', default: 500 })
	maxStorage: number

	@Column({ default: false })
	online: boolean

	@OneToMany(() => FileEntity, files => files.user)
	files: FileEntity[]
}
