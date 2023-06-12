#[cfg(test)]
pub mod test {
    use rand::Rng;

    pub fn generate_random_string(len: usize) -> String {
        let mut rng = rand::thread_rng();
        (0..len)
            .map(|_| (rng.gen::<u8>() % 26) as char)
            .map(|c| (c as u8 + b'a') as char)
            .collect()
    }
}
