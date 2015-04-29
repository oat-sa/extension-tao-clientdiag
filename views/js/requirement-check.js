(function () {
    if(document.getElementsByClassName){
        var msgArea = document.getElementById('requirement-check').getElementsByClassName('requirement-msg-area')[0],
        tests = [
        ],
        i = tests.length;

        while(i--) {
            if(!Modernizr[tests[i]]) {
                msgArea.innerHTML = 'This browser is not supported by the TAO platform';
                document.documentElement.className = 'no-js';
                break;
            }
        }
    } else{
        document.getElementById('requirement-msg-area').innerHTML = 'This browser is not supported by the TAO platform';
        document.getElementById('proceed').style.display = "none";

        document.getElementById('message').className = "alert";

    }
    
}());

