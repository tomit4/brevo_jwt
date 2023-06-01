const SibApiV3Sdk = require('sib-api-v3-sdk')
const defaultClient = SibApiV3Sdk.ApiClient.instance
require('dotenv').config()

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.API_KEY

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

const sendinblue = sendSmtpEmail => {
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        data => {
            console.log('data from sendTransacEmail :=>', data)
            return true
        },
        error => {
            console.error('ERROR :=>', error)
            return false
        },
    )
}

module.exports = sendinblue