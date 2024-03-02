const handleLoginResult = async () => {
    // NEW - update the UI state
    if (location.search.includes("state=") &&
        (location.search.includes("code=") ||
            location.search.includes("error="))) {
        console.log("location.search:" + location.search);
        await auth0Client.handleRedirectCallback();
        const userProfile = await auth0Client.getUser();
        document.getElementById("loginResult").innerHTML = "Login successful! " + userProfile.name;
        console.log(`userProfileName: ${userProfile.name}`);
        console.log(userProfile);

        console.log("Checking session")
        auth0Client.checkSession();
        console.log("Done checking session")

        console.log("sleeping");
        await new Promise(r => setTimeout(r, 2000));

        window.location.href = "/";
        //location.reload();


        // window.history.replaceState({}, document.title, "/");
    } else {
        document.getElementById("loginResult").innerHTML = "No login result...";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    (async () => {
        await configureClient();
        //console.log("sleeping");
        // sleep 2s await new Promise(r => setTimeout(r, 2000));
        console.log("Handling login result");
        auth0Client.checkSession();
        const isAuthenticated = await auth0Client.isAuthenticated();
        console.log("is authenticated:" + isAuthenticated);
        console.log("Handling login result");
        await handleLoginResult();

        const isAuthenticated2 = await auth0Client.isAuthenticated();
        console.log("is authenticated:" + isAuthenticated2);

        // window.history.replaceState({}, document.title, "/");

    })()
});
