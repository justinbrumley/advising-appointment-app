"use strict";var $cwid=$("#cwid"),$password=$("#password");$("#login-form-submit").on("click",function(s){return $.ajax({url:"/users/login",accepts:"json",data:{cwid:$cwid.val(),password:$password.val()},dataType:"json",type:"POST"}).done(function(s){s?1==s.success?window.location.href="/":console.log(s.message):console.log("no response")}),!1});