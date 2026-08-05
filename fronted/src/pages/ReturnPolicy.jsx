import React from "react";


const textualStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    lineHeight: '1.8',
    color: '#a1a1aa'
};


const ReturnPolicy = () => {
   return (
    <div style={textualStyle}>
        <h2 style={{color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px'}}>Return & Refund Policy</h2>
        <p style={{marginBottom: '20px'}}>
            At ShopNest, we proudly stand behind the quality of our marchandies, If for any reason you are completely disastified with your purchase, you may securely initiate a return within 30 days of recieving your order.
        </p>
        <h4 style={{color: '#f97316', marginTop: '25px', marginBottom: '10px'}}>1. Eligiblity for Return</h4>
        <p style={{marginBottom: '15px'}}>
            To be eligible for a return, the item must be completely unused, housed in the same absutele condion that it was recevied, and maintained within its original factory packing. Receipt or proof of purchase mapping are strictly required.
        </p>
        <h4 style={{color: '#f97316', marginBottom: '10px', marginTop: '25px'}}>2. Refund Proccessing</h4>
        <p style={{marginBottom: '15px'}}>
            Once your return is physical and internally inspacted, an immediate email protocol will fire notifying you of the apporval status. Approvad refunds will cleanly propagate to yeour original designated Razerpay gatway endpoint within 5-7 business working days naturally.
        </p>
        <h4 style={{color: '#f97316', marginTop: '25px', marginBottom: '10px'}}>3. Exampted Output Goods</h4>
        <p style={{marginBottom: '15px'}}>
            Certain explicit catagories such as perishable items, custom software, digital media, or physically tampered items are havely restricted and do not qualify for any standard refund sequence.
        </p>
        <h4 style={{color: '#f97316', marginTop: '25px', marginBottom: '10px'}}>4. Shipping Trassit Costs</h4>
        <p>
            You will actively remain strictly responsible for covering your own outbound logistically shipping rates associated with returning the item. Resocking fees may conditionally apply.
        </p>

    </div>
   ) 
}

export default ReturnPolicy;
