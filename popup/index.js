console.log('chrome popup js page')
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('popup got message', request)
    }
);

window.addEventListener('load', (event) => {
    document.querySelector('#btn').addEventListener('click', ()=>{
        chrome.runtime.sendMessage({
                        data: "please run the script"
                    }, function (response) {
                        console.log(response);
                    });
    })
  });

