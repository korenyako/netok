use netok_core::run_all_with_timeouts;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    // Initialize tracing subscriber for logging
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    println!("Testing parallel network diagnostics with logging...");
    println!("Run with: RUST_LOG=info cargo run --bin test_logging");
    println!();

    let snapshot = run_all_with_timeouts(Some(true)).await;
    
    println!("Snapshot contains {} nodes:", snapshot.nodes.len());
    for node in &snapshot.nodes {
        println!("  {:?}: {:?} ({:?})", node.kind, node.status, node.facts.len());
    }
    
    if let Some((down, up)) = snapshot.internet_speed {
        println!("Internet speed: {}/{} Mbps", down, up);
    } else {
        println!("Internet speed: Unknown");
    }
}
