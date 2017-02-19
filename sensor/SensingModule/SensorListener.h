#ifndef __SENSOR_LISTENER_H__
#define __SENSOR_LISTENER_H__

#include "ISensorListener.h"
#include <node.h>
#include <node_object_wrap.h>

namespace Sensing
{
  class SensorListener
    : public node::ObjectWrap
    , public ISensorListener
  {
  public:
    // This is the static call used to "register" this class
    static void Register(v8::Local<v8::Object> exports);

    inline v8::Persistent<v8::Function>& GetCallback() { return m_callback; }

    virtual void OnStateChange(SensorState state) const override;

  private:
    explicit SensorListener(SensorDescr descr);
    virtual ~SensorListener();

    // The factory method in charge of creating new objects of type SensorListener
    static void Create(v8::FunctionCallbackInfo<v8::Value> const& args);

    // Persistent static reference to the constructor we register in Init
    static v8::Persistent<v8::Function> s_constructor;

    v8::Persistent<v8::Function> m_callback;

  };
}

#endif //__SENSOR_LISTENER_H__
