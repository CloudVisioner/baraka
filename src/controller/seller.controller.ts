import { NextFunction, Request, Response } from 'express'; // req and res types
import { T } from '../libs/types/common'
import MemberService from '../models/Member.service';
import { AdminRequest, LoginInput, MemberInput } from '../libs/types/member';
import { MemberType } from '../libs/enums/member.enum';
import Errors, { HttpCode, Message } from '../libs/Error';
import makeUploader from '../libs/utils/uploader';
import path from 'path';

const sellerController: T = {};
const memberService = new MemberService();

// controllers are all objects

sellerController.goHome = (req: Request, res: Response) => { // translating the req and res into TypeLanguage
    try {
        console.log('goHome');
        res.render('home');
        // send | redirect | json | end | render
    } catch (err) {
        console.log('Error, goHome:', err)
        res.redirect('/admin')
    }
};

sellerController.getSignup = (req: Request, res: Response) => {
    try {
        res.render('signup');
    } catch (err) {
        console.log('Error, getSignup:', err)
        res.redirect('/admin')
    }
};


sellerController.getLogin = (req: Request, res: Response) => {
    try {
        console.log('getLogin')
        res.render('login');
    } catch (err) {
        console.log('Error, getLogin:', err);
        res.redirect('/admin');

    
    }
};


sellerController.processSignup = async (req: AdminRequest, res: Response) => { // Handles the req, async (await) waiting the tasks until they are finished
    try {
        console.log('processSignup');
        const file = req.file;
        if(!file) throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG); //

        const newMember: MemberInput = req.body // assinging req to newMember, 
        if (file) {
          const uploadsBasePath = path.join(process.cwd(), 'uploads');
          const relativePath = path.relative(uploadsBasePath, file.path);
          newMember.memberImage = relativePath.replace(/\\/g, "/");
        }
        newMember.memberType = MemberType.SELLER // Force member type to RESTAURANT  (newMember.memberType)
        const result = await memberService.processSignup(newMember); // Calling the service method and waits finishing
        // TODO: SESSIONS AUTHENTICATION

        req.session.member = result; // // 1) DB.session(member) 2) FRONTEND.cookies(sid) CORE
        req.session.save(function () { // waiting
            res.redirect("/admin/product/all");
        });

    } catch (err) {
        console.log('Error, processSignup:', err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script>alert("${message}"); window.location.replace('/admin/signup') </script>`)
    }
};

sellerController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log('processLogin');
        const input: LoginInput = req.body;
        const result = await memberService.processLogin(input); //CALL
        // TODO: SESSIONS AUTHENTICATION
        req.session.member = result; // server remembering user with session
        req.session.save(function () { // saving client's data in db.
            res.redirect("/admin/product/all");
        });

    } catch (err) {
        console.log('Error, processLogin:', err)
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script>alert("${message}"); window.location.replace('/admin/login') </script>`)
    }

};

sellerController.logout = async (req: AdminRequest, res: Response) => {
    try {
        console.log('logout')
        req.session.destroy(function () { 
            res.redirect("/admin")
        })

    } catch (err) {
        console.log('Error, logout:', err)
        res.redirect('/admin');
    }

};

sellerController.getUsers = async (req: Request, res: Response) => {
    try {
        console.log('getUsers');
        const result = await memberService.getUsers();
        console.log("result:", result)

        res.render('users', {users: result});
    } catch (err) {
        console.log('Error, getUsers:', err);
        res.redirect('/admin/login');
    }
};

sellerController.updateChosenUser = async (req: Request, res: Response) => {
    try {
        console.log('updateChosenUser');
        const result = await memberService.updateChosenUser(req.body);
        res.status(HttpCode.OK).json({data: result})
    } catch (err) {
        console.log('Error, updateChosenUser:', err);
        if (err instanceof Errors) res.status(err.code).json(err); // custom specific err
        else res.status(Errors.standard.code).json(Errors.standard.code) //custom overall err
        
    }
};


sellerController.checkAuthSession = async (req: AdminRequest, res: Response) => {
    try {
        console.log('checkAuthSession')
        if (req.session?.member) res.send(`<script>alert("${req.session.member.memberNick}")</script>`);
        else res.send(`<script>alert("${Message.NOT_AUTHENTICATED}")</script>`)
    } catch (err) {
        console.log('Error, checkAuthSession:', err)
        res.send(err);
    }

};

sellerController.verifyRestaurant = (req: AdminRequest, res: Response, next: NextFunction) => {

        if(req.session?.member?.memberType === MemberType.SELLER) { // filter
            req.member = req.session.member; // 
            next();
        } else{
        const message = Message.NOT_AUTHENTICATED
        res.send(`<script>alert("${message}"); window.location.replace('/admin/login')</script>`)
    }

}


export default sellerController;


// export  memberController; if we export without export...