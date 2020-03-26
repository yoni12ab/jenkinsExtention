// chrome extension content page
console.log('Yoni Extension----------------');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('jenkins script got message', request)
    }
);


// setInterval(() => {
//     try {
//         console.log('Yoni Extension-----interval-----------');
//        chrome.runtime.sendMessage({
//             data: "Hello popup, how are you"
//         }, function (response) {
//             console.log(response);
//         });
        
//     } catch (error) {
//         console.log(error);
//     }
// }, 2000);