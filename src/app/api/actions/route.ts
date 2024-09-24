import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, ActionPostResponse } from "@solana/actions";
import { clusterApiUrl, ComputeBudgetProgram, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios, { AxiosResponse } from 'axios';

export const GET = (req: Request) => {
    const payload : ActionGetResponse = {
        icon: new URL("/SkyTradeLogo.jpg", new URL(req.url).origin).toString(),
        label: "Join Our Waitlist!",
        description:"Enter your details to gain early access to our air rights trading feature and earn 125 SKY points when you make your first successful bid.",
        title:"Join our Waitlist and get some SKYs!",
        links: {
            actions: [
                {
                    href: req.url + "?email={email}",
                    label: "Subscribe",
                    parameters: [
                        {
                            name: "email",
                            label: "Your Email Address",
                            required: this
                        }
                    ]
                }
            ]
        }
    } 
    const response =  Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS
    });
    return response;
}; 

export const OPTIONS = GET;
export const POST = async (req:Request) => {
    try{
        const body: ActionPostRequest = await req.json();
        const url = new URL(req.url)
        const userPublicKey = body.account;
        const email = url.searchParams.get('email');

        const user = new PublicKey(userPublicKey)
        const connection = new Connection (clusterApiUrl("devnet"));
        const tx = new Transaction();
      
        tx.feePayer = user
        const bh = (await connection.getLatestBlockhash({commitment: "finalized"})).blockhash;
        tx.recentBlockhash = bh
        const serialTx = tx.serialize({requireAllSignatures: false, verifySignatures: false}).toString("base64");
        
        // Calling another API endpoint
        const postData: SecondApiPostRequestBody = {
            firstName:  "firstname",
            lastName: "test",
            email:  email,
            message: "testing the blink",
            phone: "+201099719085"
        };
        const firstResponse: AxiosResponse<SecondEndpointResponse> = await axios.post(
            'https://appnest.pro:3004/api/v1/contact-us',
            postData,  // JSON body for the POST request
            {
                headers: {
                    'Content-Type': 'application/json',  // Ensure the content-type is set to JSON
                },
            }
        );

        // Send the response from the second API back to the client
        // res.json(response.data);
        console.log(firstResponse.data)
        console.log(firstResponse.status)
        
        const response: ActionPostResponse = {
            transaction:serialTx,
            message: firstResponse.data.message + " to " + email
        }
        console.log('no errors')
        return Response.json(response, {headers:ACTIONS_CORS_HEADERS});

    }catch(err){
        console.log('a fucking error')
        return Response.json("An unknown error occured",{
            headers: ACTIONS_CORS_HEADERS,
          });
    }
};
// Define the structure of the response data from the second endpoint (adjust as needed)
interface SecondEndpointResponse {
    message: string;
}

// Define the request body structure for the second API
interface SecondApiPostRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    phone: string;
}