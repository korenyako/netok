use netok_core::run_all;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🌐 Netok Core Internet Demo");
    println!("==========================");
    
    // Test with geo disabled
    println!("\n📡 Collecting internet data (geo disabled)...");
    let snapshot = run_all(false).await;
    
    println!("\n💻 Computer Info:");
    if let Some(hostname) = &snapshot.computer.hostname {
        println!("  Hostname: {}", hostname);
    }
    if let Some(interface_name) = &snapshot.computer.interface_name {
        println!("  Interface: {}", interface_name);
    }
    if let Some(adapter_friendly) = &snapshot.computer.adapter_friendly {
        println!("  Adapter: {}", adapter_friendly);
    }
    if let Some(adapter_model) = &snapshot.computer.adapter_model {
        println!("  Model: {}", adapter_model);
    }
    println!("  Connection Type: {:?}", snapshot.computer.connection_type);
    if let Some(local_ip) = &snapshot.computer.local_ip {
        println!("  Local IP: {}", local_ip);
    }
    
    println!("\n🌍 Internet Info:");
    if let Some(internet) = &snapshot.internet {
        println!("  Reachable: {}", internet.reachable);
        if let Some(public_ip) = &internet.public_ip {
            println!("  Public IP: {}", public_ip);
        }
        if let Some(operator) = &internet.operator {
            println!("  Operator: {}", operator);
        }
        if let Some(city) = &internet.city {
            println!("  City: {}", city);
        }
        if let Some(country) = &internet.country {
            println!("  Country: {}", country);
        }
        if let Some(provider) = &internet.provider {
            println!("  Provider: {}", provider);
        }
        println!("  Timestamp: {}", internet.timestamp);
    } else {
        println!("  No internet data available");
    }
    
    // Test with geo enabled
    println!("\n📡 Collecting internet data (geo enabled)...");
    let snapshot_with_geo = run_all(true).await;
    
    if let Some(internet) = &snapshot_with_geo.internet {
        println!("\n🌍 Internet Info (with geo):");
        println!("  Reachable: {}", internet.reachable);
        if let Some(public_ip) = &internet.public_ip {
            println!("  Public IP: {}", public_ip);
        }
        if let Some(operator) = &internet.operator {
            println!("  Operator: {}", operator);
        }
        if let Some(city) = &internet.city {
            println!("  City: {}", city);
        }
        if let Some(country) = &internet.country {
            println!("  Country: {}", country);
        }
        if let Some(provider) = &internet.provider {
            println!("  Provider: {}", provider);
        }
    }
    
    println!("\n✅ Demo completed successfully!");
    Ok(())
}
