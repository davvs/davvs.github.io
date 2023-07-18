let auth0Client = null;

const headerLoaded = async () => {
    console.log("headerLoaded...")
    await configureClient();

    console.log("client configured...")
    await updateUI();
};

const updateUI = async () => {
    console.log("Updating ui...")
    const isAuthenticated = await auth0Client.isAuthenticated();
    const user = await auth0Client.getUser();

    console.log("Updating authenticated: " + isAuthenticated);

    // document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
    document.getElementById("userdata").innerText = isAuthenticated ? "Logged in as " + user.name : "Not logged in";
};


const login = async () => {
    console.log("Logging in");
    returnUrl = "http://localhost:8000/loginresult.html";
    await auth0Client.loginWithRedirect({
        authorizationParams: {
            redirect_uri: returnUrl //window.location.origin
        }
    });
};

const configureClient = async () => {
    // console.log("Fetching auth config");
    // const response = await fetchAuthConfig();
    // console.log("getting json");
    // const config = await response.json();

    // console.log("creating auth0client with domain:" + config.domain + " clientId:" + config.clientId);
    console.log("Creating auth using getTokenSilently");
    auth0Client = await auth0.createAuth0Client({
        domain: "dev-ni22qmrw4a5i8d56.us.auth0.com", //config.domain,
        clientId: "qW3ACksC6PEA5Q4HS5i0QvWpr4ZLyTRT", //config.clientId
        cacheLocation: 'localstorage',
    });
    console.log("done Creating auth");
};

const fetchAuthConfig = () => fetch("/auth_config.json");


const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
};