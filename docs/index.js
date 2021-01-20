function h_sha256(message){
    return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(message));
}

var user = localStorage.getItem("user");
var pass = localStorage.getItem("pass");

var logged_in = true;

var networth = 0

if(user === null || pass === null){
    logged_in = false;
}

if(logged_in){
    function init_response(){
        //console.log(this.responseText);
        if(this.responseText == "0"){
            logged_in = false;
            localStorage.removeItem("user");
            localStorage.removeItem("pass");
            location.reload();
        }
    }
    var xmlreq1 = new XMLHttpRequest();
    xmlreq1.addEventListener("load", init_response);
    xmlreq1.open("GET", "https://cfstonks.loca.lt/login?u=" + user + "&p=" + pass);
    xmlreq1.setRequestHeader("Bypass-Tunnel-Reminder", "x");
    xmlreq1.send();
}

function getMoney(val){
    return (Math.round(val * 100) / 100).toString();
}

function incNet(val){
    networth += val
    document.getElementById("networth").innerHTML = getMoney(networth);
}

if(logged_in){
    document.getElementById("signed-out").innerHTML = "";
    document.getElementById("username").innerHTML = user;
    function get_response(){
        var user_data = JSON.parse(this.responseText);
        //console.log(user_data);
        document.getElementById("money").innerHTML = getMoney(user_data["$"]);
        incNet(user_data["$"]);
        for(let handle in user_data["stonk"]){
            function cf_response(){
                cf_data = JSON.parse(this.responseText);
                rating = cf_data["result"][0]["rating"];
                price = Math.pow(1.002, rating);
                chandle = cf_data["result"][0]["handle"].toLowerCase();
                //console.log(user_data["stonk"][chandle].toString() + " stocks of " + chandle + " at " + price.toString() + " each (rated " + rating.toString() + ")");
                incNet(price * user_data["stonk"][chandle]);
                document.getElementById("stocks").innerHTML += user_data["stonk"][chandle].toString() + " stocks of " + chandle + " at " + getMoney(price) + " each (rated " + rating.toString() + ")</br>"
            }
            var cfreq = new XMLHttpRequest();
            cfreq.addEventListener("load", cf_response);
            cfreq.open("GET", "https://codeforces.com/api/user.info?handles=" + handle);
            cfreq.send();
        }
    }
    var xmlreq1 = new XMLHttpRequest();
    xmlreq1.addEventListener("load", get_response);
    xmlreq1.open("GET", "https://cfstonks.loca.lt/get?u=" + user);
    xmlreq1.setRequestHeader("Bypass-Tunnel-Reminder", "x");
    xmlreq1.send(); 
}else{
    document.getElementById("signed-in").innerHTML = "";
}

function register(){
    function reg_response(){
        //console.log(this.responseText);
        if(this.responseText == "0"){
            alert("Error in registering.");
            return;
        }else{
            login();
        }
    }
    reg_user = document.getElementById("sign-username").value;
    reg_pass = document.getElementById("sign-password").value;
    var regreq = new XMLHttpRequest();
    regreq.addEventListener("load", reg_response);
    //console.log(h_sha256(reg_pass));
    regreq.open("GET", "https://cfstonks.loca.lt/reg?u=" + reg_user + "&p=" + h_sha256(reg_pass));
    regreq.setRequestHeader("Bypass-Tunnel-Reminder", "x");
    regreq.send();
}

function login(){
    login_user = document.getElementById("sign-username").value;
    login_pass = document.getElementById("sign-password").value;
    function login_response(){
        //console.log(this.responseText);
        if(this.responseText == "0"){
            alert("Error logging in. (Maybe incorrect credentials)");
            return;
        }else{
            localStorage.setItem("user", login_user);
            localStorage.setItem("pass", h_sha256(login_pass));
            location.reload();
        }
    }
    var regreq = new XMLHttpRequest();
    regreq.addEventListener("load", login_response);
    //console.log(h_sha256(login_pass));
    regreq.open("GET", "https://cfstonks.loca.lt/login?u=" + login_user + "&p=" + h_sha256(login_pass));
    regreq.setRequestHeader("Bypass-Tunnel-Reminder", "x");
    regreq.send();
}

function logout(){
    localStorage.removeItem("user");
    localStorage.removeItem("pass");
    location.reload();
}

function invest(){
    handle = document.getElementById("handle").value;
    amt = document.getElementById("amt").value;
    function invest_response(){
        //console.log(this.responseText);
        if(this.responseText == "0"){
            alert("There was a problem investing");
        }else{
            location.reload();
        }
    }
    var xmlreq1 = new XMLHttpRequest();
    xmlreq1.addEventListener("load", invest_response);
    xmlreq1.open("GET", "https://cfstonks.loca.lt/invest?u=" + user + "&p=" + pass + "&handle=" + handle + "&amt=" + amt);
    xmlreq1.setRequestHeader("Bypass-Tunnel-Reminder", "x");
    xmlreq1.send();
}

function sell(){
    handle = document.getElementById("sellhandle").value;
    amt = document.getElementById("sellamt").value;
    function sell_response(){
        //console.log(this.responseText);
        if(this.responseText == "0"){
            alert("There was a problem selling");
        }else{
            location.reload();
        }
    }
    var xmlreq1 = new XMLHttpRequest();
    xmlreq1.addEventListener("load", sell_response);
    xmlreq1.open("GET", "https://cfstonks.loca.lt/sell?u=" + user + "&p=" + pass + "&handle=" + handle + "&amt=" + amt);
    xmlreq1.setRequestHeader("Bypass-Tunnel-Reminder", "x"); 
    xmlreq1.send();
}
