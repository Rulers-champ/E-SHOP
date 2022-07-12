import bcrypt from 'bcryptjs'

const users = [
    {
        name:'Admin User',
        email:'khatuapritam@gmail.com',
        password:bcrypt.hashSync('123456',10),
        admin:true
    },
    {
        name:'John Doe',
        email:'john@example.com',
        password:bcrypt.hashSync('123456',10),
    },
    {
        name:'Jane Doe',
        email:'jane@example.com',
        password:bcrypt.hashSync('123456',10),
    },
    
]

export default users