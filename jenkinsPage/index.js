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


(()=>{
    console.clear();
    const mainPage = '/job/scheduled/job/mgmt-fe-auto/job/nightly-on-forensics/';
    const jobStatusesToGet = ['Success','Unstable'];
    const skipJobs = 0;// 0 is first
    main(mainPage,jobStatusesToGet, skipJobs);
    return;

   async function main(mainPageUrl,jobStatusesToGet, skipJobs){
        const mainPageHtmlString = await getPageContent(mainPageUrl);
        const lastBuildObj = getLastBuildObj(mainPageHtmlString,jobStatusesToGet, skipJobs);
        const successfulBuildConsoleHtmlString = await getPageContent(lastBuildObj.consoleUrl);
        const cred = getMachineUrlAndCredentials(successfulBuildConsoleHtmlString);
        const proxyStr = convertToProxyString({...cred, ...lastBuildObj});
        const localhostUrl = getLocalHostUrl(cred);
        const deviceUrl = getDeviceUrl(cred);
        console.log(cred);
        console.log(proxyStr);
        console.log(localhostUrl);
        console.log(deviceUrl);
        //openLocalHost(cred);
    }

    async function getPageContent(pageUrl){
        return await (await fetch(pageUrl)).text(); 
    }

    function getLastBuildObj(mainPageHtmlString, jobStatusesToGet, skipJobs){
       const tempDiv = document.createElement('div');
       tempDiv.innerHTML =  mainPageHtmlString;
       const selector = jobStatusesToGet.map(status => `.pane-content img[tooltip*="${status}"]`).join(' , ');
       const statusImg = tempDiv.querySelectorAll(selector)[skipJobs];
       const consoleUrl = statusImg.parentElement.getAttribute('href');
       const status = new RegExp('(?<=tooltip\=\")(.*?)(?= )').exec(statusImg.outerHTML)[0];
       const date = new Date(statusImg.closest('.build-row-cell').querySelector('[time]').innerText.trim());
       return {consoleUrl, status, date};
    }

     function getMachineUrlAndCredentials(successfulBuildConsoleHtmlString){
       const tempDiv = document.createElement('div');
       tempDiv.innerHTML =  successfulBuildConsoleHtmlString;
       const url = tempDiv.querySelector('a[href*="username"]').getAttribute('href');
       const host = new RegExp(/(?<=https:\/\/).*(?=\/login)/).exec(url)[0];
       const username =  new RegExp(/(?<=username\=).*(?=\&)/).exec(url)[0];
       const password =  new RegExp(/(?<=password\=).*/).exec(url)[0];
       return {
           url: getDeviceUrl({host, username, password}),
           host,
           username,
           password,
       };
    }

    function convertToProxyString({
           url,
           host,
           username,
           password,
           date,
           status
       }){
        return `{
            "target": "https://${host}",
            "secure": false,
            "changeOrigin": true,
            "ws": true,
            "solDomain": "${host}",
            "solUser": "${username}",
            "solPassword": "${password}",
            "loginLink": "${url}",
            "buildDate": "${date}",
            "status": "${status}"
        }`

    }

    function openLocalHost({url: loginLink, host}){
        const localhost = loginLink.replace(host,'localhost:4200').replace('https', 'http');
        window.open(localhost);
    }

    function getLocalHostUrl({username, password}){
        return `http://localhost:4200/login?username=${username}&password=${encode(password)}`;
    }

     function getDeviceUrl({host, username, password}){
        return `https://${host}/login?username=${username}&password=${encode(password)}`;
    }

})()