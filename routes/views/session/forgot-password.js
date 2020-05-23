var keystone = require('keystone'),
    User = keystone.list('User');
//var Email = require('keystone-emailer');
//var enmailer=require('keystone-enmailer');

exports = module.exports = function(req, res) {
    
    var view = new keystone.View(req, res);
    
    view.on('post', function(next) {
        
        if (!req.body.email) {
            req.flash('error', "Please enter an email address.");
            return next();
        }

        User.model.findOne().where('email', req.body.email).exec(function(err, user) {
            if (err) return next(err);
            if (!user) {
                req.flash('error', "Sorry, That email address is not registered in our application.");
                return next();
            }

            user.resetPasswordKey = keystone.utils.randomString([16,24]);
            user.save(function(err) {
                if (err) return next(err);

                const nodemailer = require('nodemailer');
                // Generate test SMTP service account from ethereal.email
                // Only needed if you don't have a real mail account for testing
                nodemailer.createTestAccount((err, account) => {
                // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT,
                        secure: true, // true for 465, false for other ports
                        auth: {
                            user: process.env.SITE_EMAIL_ADDRESS, // generated ethereal user
                            pass: process.env.SITE_EMAIL_PASSWD // generated ethereal password
                        }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from:'MeetUGo <system@mail.meetugo.com>',
                        to: user.email, // list of receiver
                        subject: 'Reset your MeetUGo Password (Do not reply)', // Subject line
                        text: 'Reset your Password', // plain text body
                        html: '<p>Hey! Click to reset your password</p><a href="http://meetugo.com/reset-password/' + user.resetPasswordKey+'"><p>Click</p></a><p>Do not share the link to others</p>' // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (err) {
                            console.error(err);
                            req.flash('error', 'Error sending reset password email!');
                            next();
                        } 
                        else {
                            req.flash('success', 'We have emailed you a link to reset your password');
                           // res.redirect('/signin');
                           next();
                        }

                        console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                    });
                });
            }); 
        });
    });
    
    view.render('session/forgot-password');
    
}