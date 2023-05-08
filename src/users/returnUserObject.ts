import {
	FindOptionsRelationByString,
	FindOptionsRelations,
	FindOptionsSelect,
	FindOptionsSelectByString,
} from 'typeorm'
import { UserEntity } from './entities/user.entity'

export const returnUserProfileObject:
	| FindOptionsSelect<UserEntity>
	| FindOptionsSelectByString<UserEntity> = {
	id: true,
	email: true,
	name: true,
	username: true,
	role: true,
	createdAt: true,
	isActivated: true,
	avatarPath: true,
	updatedAt: true,
	currentStorage: true,
	files: true,
	maxStorage: true,
	online: true,
}

export const returnGlobalUserObject:
	| FindOptionsSelect<UserEntity>
	| FindOptionsSelectByString<UserEntity> = {
	id: true,
	name: true,
	username: true,
	role: true,
	createdAt: true,
	avatarPath: true,
	updatedAt: true,
	online: true,
}

export const returnRelationsUserProfile:
	| FindOptionsRelationByString
	| FindOptionsRelations<UserEntity> = {
	files: true,
}

export const returnRelationsGlobalUser:
	| FindOptionsRelationByString
	| FindOptionsRelations<UserEntity> = {}

export const returnUserProfile = {
	relations: returnRelationsUserProfile,
	select: {
		...returnUserProfileObject,
	},
}

export const returnGlobalUser = {
	relations: returnRelationsGlobalUser,
	select: {
		...returnGlobalUserObject,
	},
}
