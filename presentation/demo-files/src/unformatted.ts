// Este archivo está MAL FORMATEADO a propósito
// Para demostrar el hook de auto-format con biome

import {User} from './types'
import {validateEmail,hashPassword} from './utils'

export async function createUser(name:string,email:string,password:string):Promise<User>{
const trimmedEmail=email.trim().toLowerCase()
if(!validateEmail(trimmedEmail)){throw new Error('Invalid email')}
const hashedPassword=await hashPassword(password)
const user:User={id:crypto.randomUUID(),name:name.trim(),email:trimmedEmail,password:hashedPassword,createdAt:new Date()}
return user
}

export function getUserDisplayName(user:User):string{
if(user.name&&user.name.length>0){return user.name}else{return user.email.split('@')[0]}}

export const formatDate=(date:Date):string=>{const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0');return `${year}-${month}-${day}`}
