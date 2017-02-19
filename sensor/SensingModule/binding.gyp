{
  "targets": [
    {
      "target_name": "SensingModule",
      "sources": [
        "SensingModule.cc",
        "Sensor.cc",
        "SensorListener.cc",
        "PIR.cc"
      ],
      "cflags": ["-Wall", "-std=c++11"],
      "defines" : ["PIR_FAKE"],
      "conditions": [
        [ "OS=='mac'", {
            "xcode_settings": {
                "OTHER_CPLUSPLUSFLAGS" : ["-std=c++11","-stdlib=libc++"],
                "OTHER_LDFLAGS": ["-stdlib=libc++"],
                "MACOSX_DEPLOYMENT_TARGET": "10.7" }
            }
        ]
      ]
    }
  ]
}
