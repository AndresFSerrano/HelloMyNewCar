const fs = require('fs');
const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');


const Products = db.Product;
const Categories = db.Category;
const Provinces = db.Province;
const Users = db.User;
const Rols = db.Rol;


const usersController = {
    users: function(req,res,next) {
        db.Rol.findAll()
        .then(roles =>{
        db.User.findAll({include: ['rol']}).then(users =>{
            res.render('./partials/users/users',{users,roles})})
    })},
    create: function(req,res,next) {
        let allRoles;
        db.Rol.findAll()
            .then(roles => {
                allRoles = roles;
            }
        ).then( ()=>{
            res.render('register',{allRoles})
        })
    },
    newUsers: function(req,res) {       
            db.User.create({
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    tel: req.body.tel,
                    email: req.body.email,
                    pass: bcrypt.hashSync(req.body.pass,10),
                    image: 'default.jpg',
                    rol_id: 2,
                }
            ).then(() =>{
                res.redirect('../users');
            })
    },
    modificar: function(req,res,next) {
        let AllRoles;
        let AllUsers;
        let idUser = req.params.id;
        db.Rol.findAll()
        .then(roles =>{
            AllRoles = roles;
        })
        db.User.findAll()
        .then(users =>{
            AllUsers=users;
        })
        .then(()=>{
            res.render('./partials/users/modificarUsers', {AllRoles,AllUsers,idUser})
        })
    },
    update: function(req,res){
        if (req.file){
            let filename = req.file.filename;
            db.User.update({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                tel: req.body.tel,
                email: req.body.email,
                pass:bcrypt.hashSync(req.body.pass,10),
                image: filename,
            },
            {
                where:{
                    id: req.params.id,
                }
            }).then(()=>{
                res.redirect('../');
            })
        }
        else{
            db.User.update({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                tel: req.body.tel,
                email: req.body.email,
                pass: bcrypt.hashSync(req.body.pass,10),
            },
            {
                where:{
                    id: req.params.id,
                }
            }).then(()=>{
                res.redirect('../');
            })
        }
        
    },
    delete: (req,res) => {
        db.User.destroy({
            where: {
                id: req.params.id
            }
        })
        res.redirect("/users/")
    },
    login: function(req, res, next) {
        res.render('login')},
    checkLogin: async function(req,res,next){
        let errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.render('login',{mensajesDeError : errores.mapped(),old:req.body});
        }
        else{
            let usuario = await db.User.findOne({where: 
            {email: req.body.nombreUsuario,}})
                
                if(usuario){
                    let validationPass = bcrypt.compareSync(req.body.password,usuario.pass);
                    if (validationPass){
                        delete usuario.pass;
                        req.session.userLogged = usuario;
                        return res.redirect('/users/profile');
                    }
                    else{
                        return res.render('login',{mensajesDeError : {password:{msg:'La contraseña ingresada no es correcta'}},old:req.body});

                    }
                }
                else{
                return res.render('login',
                {mensajesDeError :{
                    nombreUsuario:{
                        msg:'Verifica el email introducido'},
                                    },
                    old:req.body,
                });}
            }
        
    },
    logged: async (req,res,next)=>{
        return res.render('./partials/users/profile',{user: req.session.userLogged})
    }  
}

module.exports = usersController;