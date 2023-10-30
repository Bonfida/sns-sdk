use super::Record;
use crate::error::SnsError;
use {
    bech32,
    bech32::u5,
    bech32::ToBase32,
    ed25519_dalek,
    solana_program::pubkey::Pubkey,
    std::net::{Ipv4Addr, Ipv6Addr},
};

pub fn check_sol_record(
    record: &[u8],
    signed_record: &[u8],
    pubkey: Pubkey,
) -> Result<bool, SnsError> {
    let key = ed25519_dalek::PublicKey::from_bytes(&pubkey.to_bytes())?;
    let sig = ed25519_dalek::Signature::from_bytes(signed_record)?;
    let res = key.verify_strict(record, &sig).is_ok();
    Ok(res)
}

pub fn get_record_size(record: Record) -> Option<usize> {
    match record {
        Record::Sol => Some(96),
        Record::Eth | Record::Bsc | Record::Injective => Some(20),
        Record::A => Some(4),
        Record::AAAA => Some(16),
        _ => None,
    }
}

pub fn deserialize_record(
    data: &[u8],
    record: Record,
    record_key: &Pubkey,
) -> Result<String, SnsError> {
    let size = get_record_size(record);

    if size.is_none() {
        let des = String::from_utf8(data.to_vec())?
            .trim_end_matches('\0')
            .to_string();
        return Ok(des);
    }

    let size = size.unwrap();
    let idx = data
        .iter()
        .rposition(|&byte| byte != 0)
        .map_or(0, |pos| pos + 1);

    // Old record UTF-8 encoded
    if size != idx {
        let address = String::from_utf8(data[0..idx].to_vec())?;
        match record {
            Record::Injective => {
                let (prefix, data, _) = bech32::decode(&address)?;
                if prefix == "inj" && data.len() == 32 {
                    return Ok(address);
                }
            }
            Record::Eth | Record::Bsc => {
                let prefix = address.get(0..2).ok_or(SnsError::InvalidRecordData)?;
                let hex = address.get(2..).ok_or(SnsError::InvalidRecordData)?;
                let decoded = hex::decode(hex)?;
                if prefix == "0x" && decoded.len() == 20 {
                    return Ok(address);
                }
            }
            Record::A => {
                let des = address.parse::<Ipv4Addr>();
                if des.is_ok() {
                    return Ok(address);
                }
            }
            Record::AAAA => {
                let des = address.parse::<Ipv6Addr>();
                if des.is_ok() {
                    return Ok(address);
                }
            }
            _ => {}
        }
        return Err(SnsError::InvalidReverse);
    }

    // Properly sized record
    match record {
        Record::Sol => {
            let signature = data.get(32..).ok_or(SnsError::InvalidRecordData)?;
            let dst = data.get(0..32).ok_or(SnsError::InvalidRecordData)?;
            let expected = [dst, &record_key.to_bytes()].concat();
            let valid = check_sol_record(&expected, signature, *record_key)?;
            if valid {
                let pubkey = Pubkey::new_from_array(dst.try_into().unwrap());
                return Ok(pubkey.to_string());
            }
        }
        Record::Eth | Record::Bsc => {
            let des = format!("0x{}", hex::encode(data));
            return Ok(des);
        }
        Record::Injective => {
            let des = bech32::encode("inj", data.to_base32(), bech32::Variant::Bech32)?;
            return Ok(des);
        }
        Record::A => {
            let bytes: [u8; 4] = data.try_into().unwrap();
            let ip = Ipv4Addr::from(bytes);
            return Ok(ip.to_string());
        }
        Record::AAAA => {
            let bytes: [u8; 16] = data.try_into().unwrap();
            let ip = Ipv6Addr::from(bytes);
            return Ok(ip.to_string());
        }
        _ => {}
    }

    Err(SnsError::InvalidRecordData)
}

pub fn serialize_record(content: &str, record: Record) -> Result<Vec<u8>, SnsError> {
    let size = get_record_size(record);

    if size.is_none() {
        match record {
            Record::CNAME | Record::TXT => {
                let encoded = punycode::encode(content).map_err(|_| SnsError::Punycode)?;
                return Ok(encoded.as_bytes().to_vec());
            }
            _ => return Ok(content.as_bytes().to_vec()),
        };
    }

    match record {
        Record::Eth | Record::Bsc => {
            if !content.starts_with("0x") {
                return Err(SnsError::InvalidEvmAddress);
            }
            let decoded = hex::decode(content.get(2..).ok_or(SnsError::InvalidEvmAddress)?)?;
            if decoded.len() != 20 {
                return Err(SnsError::InvalidEvmAddress);
            }
            Ok(decoded)
        }
        Record::Injective => {
            if !content.starts_with("inj") {
                return Err(SnsError::InvalidInjectiveAddress);
            }
            let (_, data, _) = bech32::decode(content)?;
            let data = convert_u5_array(&data);
            if data.len() != 20 {
                return Err(SnsError::InvalidInjectiveAddress);
            }
            Ok(data)
        }
        Record::A => {
            let ip = content
                .parse::<Ipv4Addr>()
                .map_err(|_| SnsError::InvalidIpv4)?;
            Ok(ip.octets().to_vec())
        }
        Record::AAAA => {
            let ip = content
                .parse::<Ipv6Addr>()
                .map_err(|_| SnsError::InvalidIpv6)?;
            Ok(ip.octets().to_vec())
        }
        Record::Sol => Err(SnsError::SolRecordNotSupported),
        _ => unreachable!(),
    }
}

pub fn convert_u5_array(u5_data: &[u5]) -> Vec<u8> {
    let mut u8_data: Vec<u8> = Vec::new();
    let mut buffer: u16 = 0;
    let mut buffer_length: u8 = 0;
    for u5 in u5_data {
        buffer = (buffer << 5) | (u5.to_u8() as u16);
        buffer_length += 5;
        while buffer_length >= 8 {
            u8_data.push((buffer >> (buffer_length - 8)) as u8);
            buffer_length -= 8;
        }
    }
    // Make sure there's no remaining data in the buffer
    if buffer_length > 0 {
        u8_data.push((buffer << (8 - buffer_length)) as u8);
    }
    u8_data
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_serialize_record() {
        let data = serialize_record(
            "inj1l3vt52kqzlvpaw2wfug45qkyncflq8hgr5nem7",
            Record::Injective,
        )
        .unwrap();
        assert_eq!(
            data,
            [
                252, 88, 186, 42, 192, 23, 216, 30, 185, 78, 79, 17, 90, 2, 196, 158, 19, 240, 30,
                232,
            ]
            .to_vec()
        );
        let data = serialize_record("192.168.0.1", Record::A).unwrap();
        assert_eq!(data, [192, 168, 0, 1].to_vec());
    }

    #[test]
    fn test_convert_u5_array() {
        let expected = [
            252, 88, 186, 42, 192, 23, 216, 30, 185, 78, 79, 17, 90, 2, 196, 158, 19, 240, 30, 232,
        ]
        .to_vec();
        let (_, data, _) = bech32::decode("inj1l3vt52kqzlvpaw2wfug45qkyncflq8hgr5nem7").unwrap();
        assert_eq!(expected, convert_u5_array(&data))
    }
}
