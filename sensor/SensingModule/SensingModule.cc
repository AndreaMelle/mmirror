#include <node.h>
#include "SensorListener.h"
#include "Sensor.h"

namespace Sensing
{
  static void OnExit(void*)
  {
    Sensor::GetInstance().Stop();
  }

  void InitModule(v8::Local<v8::Object> exports)
  {
    node::AtExit(OnExit);

    Sensor::GetInstance().Start();

    SensorListener::Register(exports);
  }

  NODE_MODULE(SensingModule, InitModule)

}
