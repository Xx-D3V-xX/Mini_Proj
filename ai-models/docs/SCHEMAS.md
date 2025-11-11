# JSON Schemas

## router_plan.schema.json
```json
{ "type":"object",
  "required":["intent","steps"],
  "properties":{
    "intent":{"type":"string","enum":["discover","single_poi","itinerary","admin","chat"]},
    "steps":{"type":"array","items":{"type":"object","required":["agent","expects"],"properties":{"agent":{"type":"string"},"input":{"type":"object"},"expects":{"type":"string"}}}},
    "needs_clarification":{"type":"array","items":{"type":"string"}}
  }
}
```

## poi_result.schema.json
```json
{ "type":"object",
  "required":["pois"],
  "properties":{
    "status":{"type":"string"},
    "pois":{"type":"array","items":{"type":"object",
      "required":["id","name","lat","lon","evidence"],
      "properties":{
        "id":{"type":"string"},
        "name":{"type":"string"},
        "lat":{"type":"number"},
        "lon":{"type":"number"},
        "score":{"type":"number"},
        "rating":{"type":"number"},
        "price_level":{"type":"integer"},
        "evidence":{"type":"array","items":{"type":"string"}}
      }
    }}
  }
}
```

## itinerary.schema.json
```json
{ "type":"object",
  "required":["days"],
  "properties":{
    "days":{"type":"array","items":{"type":"object",
      "required":["date","blocks"],
      "properties":{
        "date":{"type":"string"},
        "blocks":{"type":"array","items":{"type":"object",
          "required":["start","end","poi_id"],
          "properties":{"start":{"type":"string"},"end":{"type":"string"},"poi_id":{"type":"string"},"notes":{"type":"string"}}}},
        "assumptions":{"type":"array","items":{"type":"string"}},
        "weather_advice":{"type":"string"}
      }
    }}
  }
}
```

## chat_reply.schema.json
```json
{ "type":"object",
  "required":["message_markdown","quick_actions"],
  "properties":{
    "message_markdown":{"type":"string"},
    "quick_actions":{"type":"array","items":{"type":"object",
      "required":["label","payload"],
      "properties":{"label":{"type":"string"},"payload":{"type":"object"}}}},
    "poi_ids_referenced":{"type":"array","items":{"type":"string"}}
  }
}
```

## memory_item.schema.json
```json
{ "type":"object",
  "required":["type","text"],
  "properties":{
    "type":{"type":"string","enum":["preference","constraint","fact"]},
    "text":{"type":"string"},
    "ttl_days":{"type":"integer"},
    "hash":{"type":"string"}
  }
}
```
