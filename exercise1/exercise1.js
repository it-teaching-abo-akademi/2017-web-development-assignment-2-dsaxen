$(document).ready(function(){ //jquery for the sliding, wait for DOM to be ready before executing
    $("#togglebutton").click(function(){
        if ($(this).text()=="Show"){
            $(this).text("Hide"); //change button text to "Hide" if you clicked "Show"
        }
        else{
            $(this).text("Show"); //change button text to "Show" if you clicked "Hide"
        }
        $("#information").slideToggle(700); //700 ms
    });
});

window.onload = pageLoad; //load 

function pageLoad(){
    document.getElementById("barcodeinput").onfocus = changeBackgroundToGrey; //same happens when pasting data
    document.getElementById("barcodeinput").onblur = changeBackgroundToWhite; //same happens when pasting data
    document.getElementById("barcodesubmit").onclick = processInformation; //when clicking the decode button, we parse the bar code
}

function changeBackgroundToGrey(){
    var input = document.getElementById("barcodeinput");
    input.style.backgroundColor = "lightGrey";
}
function changeBackgroundToWhite(){
    var input = document.getElementById("barcodeinput");
    input.style.backgroundColor = "white";
}

function processInformation(){ //parsing the bar code
    barcode = document.getElementById("barcodeinput").value.trim(); //trim spaces away
    
    if (barcode == "") {
        alert("You must type a barcode");
        return false;
    }
    //IBAN
    var version = barcode.substr(0,1);
    var accountnumber = "FI"+barcode.substr(1,16);
    accountnumber = accountnumber.replace(/(.{4})/g, '$1 '); //space between every fourth character
    document.getElementById("iban").innerHTML = "Payee's IBAN: " + accountnumber; //display the iban number
    
    //AMOUNT
    var euros = Number(barcode.substr(17,6)).toString(); //number trims leading zeros
    var cents = barcode.substr(23,2);
    document.getElementById("amount").innerHTML = "Amount to be paid: " + euros + "." + cents + " €"; //display the amount

    //REFERENCE
    if(version == 4){ //national reference format
        var referencenumber = Number(barcode.substr(28,20)).toString(); //yet again, number trims leading zeros
        referencenumber = referencenumber.replace(/(.{5})/g, '$1 '); //space between every fifth character
        document.getElementById("reference").innerHTML = "Payment reference: " + referencenumber; //display the reference
    }
    else if(version == 5){ //international reference format
        var referencenumber = "RF" + barcode.substr(25,2) + Number(barcode.substr(27,21)).toString();
        referencenumber = referencenumber.replace(/(.{4})/g, '$1 '); //space between every fourth character
        document.getElementById("reference").innerHTML = "Payment reference: " + referencenumber; //display the reference
    }
    
    //DUE DATE
    var date = barcode.substr(48,6);
    if (date == "000000"){
        document.getElementById("duedate").innerHTML = "Due date: None";  //display the date
    }
    else{ 
        var year = "20"+date.substr(0,2);
        var month = date.substr(2,2);
        var day = date.substr(4,2);
        var duedate = day + "." + month + "." + year;
        document.getElementById("duedate").innerHTML = "Due date: " + duedate;  //display the date
    }
    
    //BAR CODE
    var element = document.getElementById("barcodecanvas");
    JsBarcode(element, barcode);
    
    
}
