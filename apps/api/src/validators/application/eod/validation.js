import { validString } from "../commonValidations.js";
const validate_sexual_orientation = (sex)=>{
    validString(sex, "sexual orientation")
    const sexMap = {
        'heterosexual': 'Heterosexual',
        'homosexual': 'Homosexual',
        'gay': 'Homosexual',
        'lesbian': 'Homosexual',
        'bisexual': 'Bisexual',
        'asexual': 'Asexual',
        'noanswer': 'Prefer not to say',
        'other': 'Prefer not to say',
        'Heterosexual': 'Heterosexual',
        'Homosexual': 'Homosexual',
        'Bisexual': 'Bisexual',
        'Asexual': 'Asexual',
        'Prefer not to say': 'Prefer not to say'
    };
    sex = sex.trim();
    const mapped = sexMap[sex] || sexMap[sex.toLowerCase()];
    if(!mapped){
        throw `Sexual orientation should be a valid option`;
    }
    return mapped;
}

const  validate_disability =(val)=>{
    const disabilityMap = {
        'yes': 'Yes',
        'no': 'No',
        'noanswer': 'Prefer not to say',
        'Yes': 'Yes',
        'No': 'No',
        'Prefer not to say': 'Prefer not to say'
    };
    validString(val, "disability");
    val = val.trim();
    const mapped = disabilityMap[val] || disabilityMap[val.toLowerCase()];
    if(!mapped){
        throw `disability should be 'Yes', 'No', or 'Prefer not to say'`;
    }
    return mapped;
}

const EOD = (data)=>{
    if(data == undefined){
        throw `EOD is needed`;
    }
    let {disability, sexual_orientation} = data;
    disability = validate_disability(disability);
    sexual_orientation = validate_sexual_orientation(sexual_orientation);
    return {disability, sexual_orientation};
}

export default EOD;